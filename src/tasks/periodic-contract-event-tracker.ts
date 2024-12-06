import BigNumber from 'bignumber.js';
import { raw } from 'objection';

import { Event, utils } from 'ethers';

BigNumber.config({ EXPONENTIAL_AT: [-1e+9, 1e+9] });

import {
  getLatestBlockNumber,
  getAllSiloAddresses,
  getAllSiloBorrowEventsSinceBlock,
  getAllSiloDepositEventsSinceBlock,
  getAllSiloRepayEventsSinceBlock,
  getAllSiloWithdrawEventsSinceBlock,
  getAllRewardsClaimedEventsSinceBlock,
  getBlocks,
} from '../web3/jobs';

import {
  SiloUserRepository,
  AssetRepository,
  BorrowEventRepository,
  DepositEventRepository,
  WithdrawEventRepository,
  RepayEventRepository,
  BlockMetadataRepository,
  RewardEventRepository,
  DeploymentIdToSyncMetadataRepository,
} from '../database/repositories'

import {
  NETWORKS,
  DEPLOYMENT_CONFIGS,
} from '../constants';

import {
  fetchCoinGeckoAssetPriceClosestToTargetTime,
} from '../utils';

import {
  getEventFingerprint,
} from '../web3/utils'

interface IUserAddressToCount {
  [key: string]: number;
}

export const periodicContractEventTracker = async (useTimestampUnix: number, startTime: number) => {

  // event Borrow(address indexed asset, address indexed user, uint256 amount);

  // event Deposit(address indexed asset, address indexed depositor, uint256 amount, bool collateralOnly);

  // event Repay(address indexed asset, address indexed user, uint256 amount);

  // event Withdraw(
  //   address indexed asset,
  //   address indexed depositor,
  //   address indexed receiver,
  //   uint256 amount,
  //   bool collateralOnly
  // );

  let useTimestampPostgres = new Date(useTimestampUnix * 1000).toISOString();

  for(let deploymentConfig of DEPLOYMENT_CONFIGS) {

    let { network, incentiveControllers, id } = deploymentConfig;

    // Get sync metadata record for deployment config
    let existingSyncRecord = await DeploymentIdToSyncMetadataRepository.getSyncRecord(id, network, 'periodic-contract-event-tracker');

    console.log({existingSyncRecord})

    try {

      if(!existingSyncRecord) {
        existingSyncRecord = await DeploymentIdToSyncMetadataRepository.create({deployment_id: id, network, sync_type: 'periodic-contract-event-tracker', in_progress: true, last_started_timestamp_unix: Math.floor(new Date().getTime() / 1000)});
      } else {
        if(existingSyncRecord.in_progress) {
          console.log(`Periodic contract event tracker SKIPPED due to IN PROGRESS status (${network} - ${deploymentConfig.id}, last started: ${existingSyncRecord.last_started_timestamp_unix}, last ended: ${existingSyncRecord.last_ended_timestamp_unix}), exec time: ${new Date().getTime() - startTime}ms`)
          continue;
        } else {
          await DeploymentIdToSyncMetadataRepository.update({in_progress: true, last_started_timestamp_unix: Math.floor(new Date().getTime() / 1000)}, existingSyncRecord.id);
        }
      }

      let latestBlockNumber = await getLatestBlockNumber(network);

      let siloAddresses = await getAllSiloAddresses(deploymentConfig);

      let [...eventBatches] = await Promise.all([
        getAllSiloBorrowEventsSinceBlock(siloAddresses, latestBlockNumber, deploymentConfig),
        getAllSiloDepositEventsSinceBlock(siloAddresses, latestBlockNumber, deploymentConfig),
        getAllSiloRepayEventsSinceBlock(siloAddresses, latestBlockNumber, deploymentConfig),
        getAllSiloWithdrawEventsSinceBlock(siloAddresses, latestBlockNumber, deploymentConfig),
      ])

      let [...rewardsClaimedEventBatches] = incentiveControllers 
        ? 
          await Promise.all(incentiveControllers?.map((entry) => {
            return getAllRewardsClaimedEventsSinceBlock(entry.address, entry.assetAddress, entry.meta, latestBlockNumber, deploymentConfig);
          }))
        : 
          [];

      let allRewardsClaimedEvents = rewardsClaimedEventBatches.reduce((acc: Event[], value: Event[]) => {
        return [...acc, ...value];
      }, []);

      let [
        borrowEvents,
        depositEvents,
        repayEvents,
        withdrawEvents
      ] = eventBatches;

      let allEvents = eventBatches.reduce((acc: Event[], value: Event[]) => {
        return [...acc, ...value];
      }, allRewardsClaimedEvents);

      let allBlockNumbers : number[] = [];
      for(let event of allEvents) {
        if(allBlockNumbers.indexOf(event.blockNumber) === -1) {
          allBlockNumbers.push(event.blockNumber);
        }
      }

      // Store timestamps for any blocks that we fetched events for
      let unfetchedBlockNumbers = [];
      let blockNumberToUnixTimestamp : {[key: string]: number} = {};
      for(let blockNumber of allBlockNumbers) {
        let currentRecord = await BlockMetadataRepository.getByBlockNumberAndNetwork(blockNumber, network);
        if(!currentRecord) {
          unfetchedBlockNumbers.push(blockNumber);
        } else {
          blockNumberToUnixTimestamp[blockNumber] = currentRecord.block_timestamp_unix;
        }
      }
      
      if(unfetchedBlockNumbers && unfetchedBlockNumbers.length > 0) {
        let blockData = await getBlocks(unfetchedBlockNumbers, network);
        for(let singleBlockData of blockData) {
          blockNumberToUnixTimestamp[singleBlockData.number] = singleBlockData.timestamp;
          let jsDate = new Date(singleBlockData.timestamp * 1000);
          let currentRecord = await BlockMetadataRepository.getByBlockNumberAndNetwork(singleBlockData.number, network);
          if(!currentRecord) {
            await BlockMetadataRepository.create({
              block_number: singleBlockData.number,
              block_timestamp_unix: singleBlockData.timestamp,
              block_timestamp: jsDate.toISOString(),
              block_hash: singleBlockData.hash,
              block_day_timestamp: new Date(jsDate.getFullYear(), jsDate.getMonth(), jsDate.getDate()),
              network,
            })
          }
        }
        console.log(`Filled in block metadata for ${blockData.length} blocks`);
      }

      if(deploymentConfig.incentiveControllers) {
        for(let rewardsClaimedEvent of allRewardsClaimedEvents) {
          let {
            address,
            blockNumber,
            args,
            transactionIndex,
            logIndex,
          } = rewardsClaimedEvent;
          let transactionReceipt = await rewardsClaimedEvent.getTransactionReceipt();
          let {
            gasUsed,
            effectiveGasPrice,
          } = transactionReceipt;
          let gasUsedUsable = gasUsed.toString();
          if(args && blockNumberToUnixTimestamp[blockNumber]) {
            let {
              amount,
            } = args;
            let assetAddress = deploymentConfig.incentiveControllers.find((entry) => entry.address === address)?.assetAddress;
            if(assetAddress) {
              let closestPrice = await fetchCoinGeckoAssetPriceClosestToTargetTime(assetAddress, network, blockNumberToUnixTimestamp[blockNumber]);
              let assetRecord = await AssetRepository.findByColumn('address', assetAddress);
              if(assetRecord) {
                let rewardClaimedValueUSD = closestPrice?.price ? new BigNumber(Number(utils.formatUnits(amount.toString(), assetRecord.decimals))).multipliedBy(closestPrice?.price).toFixed(2) : 0;
                let eventFingerprint = getEventFingerprint(network, blockNumber, transactionIndex, logIndex);
                let existingEventRecord = await RewardEventRepository.findByColumn('event_fingerprint', eventFingerprint);
                if(existingEventRecord) {
                  await RewardEventRepository.update({gas_used: gasUsedUsable ? gasUsedUsable : "0", effective_gas_price: effectiveGasPrice.toString() ? effectiveGasPrice.toString() : "0", usd_value_at_event_time: rewardClaimedValueUSD, asset_price_at_event_time: closestPrice?.price ? closestPrice?.price : 0}, existingEventRecord.id);
                }
                console.log({closestPrice, "reward claimed value": rewardClaimedValueUSD, amount: utils.formatUnits(amount.toString(), assetRecord.decimals).toString(), assetAddress});
              }
            }
          }
        }
      }

      for(let borrowEvent of borrowEvents) {
        let {
          blockNumber,
          args,
          transactionIndex,
          logIndex,
        } = borrowEvent;
        let transactionReceipt = await borrowEvent.getTransactionReceipt();
        let {
          gasUsed,
          effectiveGasPrice,
        } = transactionReceipt;
        let gasUsedUsable = gasUsed.toString();
        if(args && blockNumberToUnixTimestamp[blockNumber]) {
          let {
            asset,
            amount,
          } = args;
          let closestPrice = await fetchCoinGeckoAssetPriceClosestToTargetTime(asset, network, blockNumberToUnixTimestamp[blockNumber]);
          let assetRecord = await AssetRepository.findByColumn('address', asset);
          let borrowValueUSD = closestPrice?.price ? new BigNumber(Number(utils.formatUnits(amount.toString(), assetRecord.decimals))).multipliedBy(closestPrice?.price).toFixed(2) : 0;
          let eventFingerprint = getEventFingerprint(network, blockNumber, transactionIndex, logIndex);
          let existingEventRecord = await BorrowEventRepository.findByColumn('event_fingerprint', eventFingerprint);
          if(existingEventRecord) {
            await BorrowEventRepository.update({gas_used: gasUsedUsable ? gasUsedUsable : "0", effective_gas_price: effectiveGasPrice.toString() ? effectiveGasPrice.toString() : "0", usd_value_at_event_time: borrowValueUSD, asset_price_at_event_time: closestPrice?.price ? closestPrice?.price : 0}, existingEventRecord.id);
          }
          console.log({closestPrice, "borrow amount USD": borrowValueUSD, amount: utils.formatUnits(amount.toString(), assetRecord.decimals).toString(), asset});
        }
      }

      for(let depositEvent of depositEvents) {
        let {
          blockNumber,
          args,
          transactionIndex,
          logIndex,
        } = depositEvent;
        let transactionReceipt = await depositEvent.getTransactionReceipt();
        let {
          gasUsed,
          effectiveGasPrice,
        } = transactionReceipt;
        let gasUsedUsable = gasUsed.toString();
        if(args && blockNumberToUnixTimestamp[blockNumber]) {
          let {
            asset,
            amount,
          } = args;
          let closestPrice = await fetchCoinGeckoAssetPriceClosestToTargetTime(asset, network, blockNumberToUnixTimestamp[blockNumber]);
          let assetRecord = await AssetRepository.findByColumn('address', asset);
          let depositValueUSD = closestPrice?.price ? new BigNumber(Number(utils.formatUnits(amount.toString(), assetRecord.decimals))).multipliedBy(closestPrice?.price).toFixed(2) : 0;
          let eventFingerprint = getEventFingerprint(network, blockNumber, transactionIndex, logIndex);
          let existingEventRecord = await DepositEventRepository.findByColumn('event_fingerprint', eventFingerprint);
          if(existingEventRecord) {
            await DepositEventRepository.update({gas_used: gasUsedUsable ? gasUsedUsable : "0", effective_gas_price: effectiveGasPrice.toString() ? effectiveGasPrice.toString() : "0", usd_value_at_event_time: depositValueUSD, asset_price_at_event_time: closestPrice?.price ? closestPrice?.price : 0}, existingEventRecord.id);
          }
          console.log({closestPrice, "deposit amount USD": depositValueUSD, amount: utils.formatUnits(amount.toString(), assetRecord.decimals).toString(), asset});
        }
      }

      for(let repayEvent of repayEvents) {
        let {
          blockNumber,
          args,
          transactionIndex,
          logIndex,
        } = repayEvent;
        let transactionReceipt = await repayEvent.getTransactionReceipt();
        let {
          gasUsed,
          effectiveGasPrice,
        } = transactionReceipt;
        let gasUsedUsable = gasUsed.toString();
        if(args && blockNumberToUnixTimestamp[blockNumber]) {
          let {
            asset,
            amount,
          } = args;
          let closestPrice = await fetchCoinGeckoAssetPriceClosestToTargetTime(asset, network, blockNumberToUnixTimestamp[blockNumber]);
          let assetRecord = await AssetRepository.findByColumn('address', asset);
          let repayValueUSD = closestPrice?.price ? new BigNumber(Number(utils.formatUnits(amount.toString(), assetRecord.decimals))).multipliedBy(closestPrice?.price).toFixed(2) : 0;
          let eventFingerprint = getEventFingerprint(network, blockNumber, transactionIndex, logIndex);
          let existingEventRecord = await RepayEventRepository.findByColumn('event_fingerprint', eventFingerprint);
          if(existingEventRecord) {
            await RepayEventRepository.update({gas_used: gasUsedUsable ? gasUsedUsable : "0", effective_gas_price: effectiveGasPrice.toString() ? effectiveGasPrice.toString() : "0", usd_value_at_event_time: repayValueUSD, asset_price_at_event_time: closestPrice?.price ? closestPrice?.price : 0}, existingEventRecord.id);
          }
          console.log({closestPrice, "repay amount USD": repayValueUSD, amount: utils.formatUnits(amount.toString(), assetRecord.decimals).toString(), asset});
        }
      }

      for(let withdrawEvent of withdrawEvents) {
        let {
          blockNumber,
          args,
          transactionIndex,
          logIndex,
        } = withdrawEvent;
        let transactionReceipt = await withdrawEvent.getTransactionReceipt();
        let {
          gasUsed,
          effectiveGasPrice,
        } = transactionReceipt;
        let gasUsedUsable = gasUsed.toString();
        if(args && blockNumberToUnixTimestamp[blockNumber]) {
          let {
            asset,
            amount,
          } = args;
          let closestPrice = await fetchCoinGeckoAssetPriceClosestToTargetTime(asset, network, blockNumberToUnixTimestamp[blockNumber]);
          let assetRecord = await AssetRepository.findByColumn('address', asset);
          let withdrawValueUSD = closestPrice?.price ? new BigNumber(Number(utils.formatUnits(amount.toString(), assetRecord.decimals))).multipliedBy(closestPrice?.price).toFixed(2) : 0;
          let eventFingerprint = getEventFingerprint(network, blockNumber, transactionIndex, logIndex);
          let existingEventRecord = await WithdrawEventRepository.findByColumn('event_fingerprint', eventFingerprint);
          if(existingEventRecord) {
            await WithdrawEventRepository.update({gas_used: gasUsedUsable ? gasUsedUsable : "0", effective_gas_price: effectiveGasPrice.toString() ? effectiveGasPrice.toString() : "0", usd_value_at_event_time: withdrawValueUSD, asset_price_at_event_time: closestPrice?.price ? closestPrice?.price : 0}, existingEventRecord.id);
          }
          console.log({closestPrice, "withdraw amount USD": withdrawValueUSD, amount: utils.formatUnits(amount.toString(), assetRecord.decimals).toString(), asset});
        }
      }

      // TEMP DISABLE USER INTERACTION COUNT SYNCS BELOW
      
      // Get interaction count totals for each event grouped by user address
      // let userAddressToBorrowEventCount = await BorrowEventRepository.query().select(raw(`user_address, count(*)`)).groupBy('user_address').orderBy('count', 'DESC');
      // let userAddressToDepositEventCount = await DepositEventRepository.query().select(raw(`user_address, count(*)`)).groupBy('user_address').orderBy('count', 'DESC');
      // let userAddressToRepayEventCount = await RepayEventRepository.query().select(raw(`user_address, count(*)`)).groupBy('user_address').orderBy('count', 'DESC');
      // let userAddressToWithdrawEventCount = await WithdrawEventRepository.query().select(raw(`user_address, count(*)`)).groupBy('user_address').orderBy('count', 'DESC');

      // let userAddressToEventCountBatches = [userAddressToBorrowEventCount, userAddressToDepositEventCount, userAddressToRepayEventCount, userAddressToWithdrawEventCount];

      // // Rebuild interaction counts
      // let userAddressToInteractionCount : IUserAddressToCount = {};

      // for(let userAddressToEventCountBatch of userAddressToEventCountBatches) {
      //   for(let entry of userAddressToEventCountBatch) {
      //     const {
      //       user_address,
      //       count,
      //     } = entry;
      //     if(userAddressToInteractionCount[user_address]) {
      //       userAddressToInteractionCount[user_address] = userAddressToInteractionCount[user_address] + Number(count);
      //     } else {
      //       userAddressToInteractionCount[user_address] = Number(count);
      //     }
      //   }
      // }

      // console.log("Updating user interaction counts");

      // // Set user interaction counts
      // for(let entry of Object.entries(userAddressToInteractionCount)) {
      //   let user = entry[0];
      //   let count = entry[1];
      //   // check if user record exists
      //   let userRecord = await SiloUserRepository.findByColumn("address", user);
      //   if(!userRecord) {
      //     // create user record
      //     await SiloUserRepository.create({
      //       address: user,
      //       interaction_count: count,
      //     })
      //   } else {
      //     // increment interaction count
      //     await SiloUserRepository.update({
      //       interaction_count: count,
      //     }, userRecord.id)
      //   }
      // }

      // TEMP DISABLE USER INTERACTION COUNT SYNCS ABOVE

      await DeploymentIdToSyncMetadataRepository.update({in_progress: false, ended_by_error: false, last_ended_timestamp_unix: Math.floor(new Date().getTime() / 1000)}, existingSyncRecord.id);
      
      console.log(`Periodic contract event tracker successful (${network} - ${deploymentConfig.id}), exec time: ${new Date().getTime() - startTime}ms`)

    } catch (e) {
      await DeploymentIdToSyncMetadataRepository.update({in_progress: false, ended_by_error: true, error_message: e, last_ended_timestamp_unix: Math.floor(new Date().getTime() / 1000)}, existingSyncRecord.id);
      console.error(`Error encountered in periodicContractEventTracker (${network} - ${deploymentConfig.id}) at ${useTimestampPostgres}, exec time: ${new Date().getTime() - startTime}ms, error: ${e}`)
    }

  }
}