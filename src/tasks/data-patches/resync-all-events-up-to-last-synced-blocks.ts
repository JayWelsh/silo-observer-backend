import BigNumber from 'bignumber.js';
import { raw } from 'objection';

import { Event, utils } from 'ethers';

BigNumber.config({ EXPONENTIAL_AT: [-1e+9, 1e+9] });

import {
  getAllSiloAddresses,
  getAllSiloBorrowEventsSinceBlock,
  getAllSiloDepositEventsSinceBlock,
  getAllSiloRepayEventsSinceBlock,
  getAllSiloWithdrawEventsSinceBlock,
  getAllRewardsClaimedEventsSinceBlock,
  getBlocks,
} from '../../web3/jobs';

import {
  AssetRepository,
  BorrowEventRepository,
  DepositEventRepository,
  WithdrawEventRepository,
  RepayEventRepository,
  BlockMetadataRepository,
  RewardEventRepository,
  EventIndexerBlockTrackerRepository,
} from '../../database/repositories'

import {
  NETWORKS,
  DEPLOYMENT_CONFIGS,
} from '../../constants';

import {
  fetchCoinGeckoAssetPriceClosestToTargetTime,
} from '../../utils';

import {
  getEventFingerprint,
} from '../../web3/utils'

interface IUserAddressToCount {
  [key: string]: number;
}

export const resycAllEventsUpToLastSyncedBlocks = async (useTimestampUnix: number, startTime: number) => {

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

    let { network, incentiveControllers } = deploymentConfig;

    try {

      let lowestBlockNumberEventTrackerByNetworkAndDeploymentId = await EventIndexerBlockTrackerRepository.getLowestLastCheckedBlockRecordByNetworkAndDeploymentId(network, deploymentConfig.id);
      let latestBlockNumber = lowestBlockNumberEventTrackerByNetworkAndDeploymentId.last_checked_block;

      console.log({latestBlockNumber})

      let siloAddresses = await getAllSiloAddresses(deploymentConfig);

      let [...eventBatches] = await Promise.all([
        getAllSiloBorrowEventsSinceBlock(siloAddresses, latestBlockNumber, deploymentConfig, true),
        getAllSiloDepositEventsSinceBlock(siloAddresses, latestBlockNumber, deploymentConfig, true),
        getAllSiloRepayEventsSinceBlock(siloAddresses, latestBlockNumber, deploymentConfig, true),
        getAllSiloWithdrawEventsSinceBlock(siloAddresses, latestBlockNumber, deploymentConfig, true),
      ])

      let [...rewardsClaimedEventBatches] = incentiveControllers 
        ? 
          await Promise.all(incentiveControllers?.map((entry) => {
            return getAllRewardsClaimedEventsSinceBlock(entry.address, entry.assetAddress, latestBlockNumber, deploymentConfig, true);
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
          await BlockMetadataRepository.create({
            block_number: singleBlockData.number,
            block_timestamp_unix: singleBlockData.timestamp,
            block_timestamp: jsDate.toISOString(),
            block_hash: singleBlockData.hash,
            block_day_timestamp: new Date(jsDate.getFullYear(), jsDate.getMonth(), jsDate.getDate()),
            network,
          })
        }
        console.log(`Filled in block metadata for ${blockData.length} blocks`);
      }

      // TEMP DISABLE ALL GAS USED SYNCS

      if(deploymentConfig.incentiveControllers) {
        for(let rewardsClaimedEvent of allRewardsClaimedEvents) {
          let {
            address,
            blockNumber,
            args,
            transactionIndex,
            logIndex,
          } = rewardsClaimedEvent;
          if(args && blockNumberToUnixTimestamp[blockNumber]) {
            let {
              amount,
            } = args;
            let assetAddress = deploymentConfig.incentiveControllers.find((entry) => entry.address === address)?.assetAddress;
            if(assetAddress) {
              // let closestPrice = await fetchCoinGeckoAssetPriceClosestToTargetTime(assetAddress, network, blockNumberToUnixTimestamp[blockNumber]);
              let assetRecord = await AssetRepository.findByColumn('address', assetAddress);
              if(assetRecord) {
                // let rewardClaimedValueUSD = closestPrice?.price ? new BigNumber(Number(utils.formatUnits(amount.toString(), assetRecord.decimals))).multipliedBy(closestPrice?.price).toFixed(2) : 0;
                let eventFingerprint = getEventFingerprint(network, blockNumber, transactionIndex, logIndex);
                let existingEventRecord = await RewardEventRepository.findByColumn('event_fingerprint', eventFingerprint);
                if(existingEventRecord && !existingEventRecord.effective_gas_price) {
                  let transactionReceipt = await rewardsClaimedEvent.getTransactionReceipt();
                  let {
                    gasUsed,
                    effectiveGasPrice,
                  } = transactionReceipt;
                  let gasUsedUsable = gasUsed.toString();
                  await RewardEventRepository.update({
                    gas_used: gasUsedUsable,
                    effective_gas_price: effectiveGasPrice.toString(),
                    // usd_value_at_event_time: rewardClaimedValueUSD,
                    // asset_price_at_event_time: closestPrice?.price ? closestPrice?.price : 0
                  }, existingEventRecord.id);
                }
                // console.log({closestPrice, "reward claimed value": rewardClaimedValueUSD, amount: utils.formatUnits(amount.toString(), assetRecord.decimals).toString(), assetAddress});
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
        if(args && blockNumberToUnixTimestamp[blockNumber]) {
          let {
            asset,
            amount,
          } = args;
          // let closestPrice = await fetchCoinGeckoAssetPriceClosestToTargetTime(asset, network, blockNumberToUnixTimestamp[blockNumber]);
          // let assetRecord = await AssetRepository.findByColumn('address', asset);
          // let borrowValueUSD = closestPrice?.price ? new BigNumber(Number(utils.formatUnits(amount.toString(), assetRecord.decimals))).multipliedBy(closestPrice?.price).toFixed(2) : 0;
          let eventFingerprint = getEventFingerprint(network, blockNumber, transactionIndex, logIndex);
          let existingEventRecord = await BorrowEventRepository.findByColumn('event_fingerprint', eventFingerprint);
          if(existingEventRecord && !existingEventRecord.effective_gas_price) {
            let transactionReceipt = await borrowEvent.getTransactionReceipt();
            let {
              gasUsed,
              effectiveGasPrice,
            } = transactionReceipt;
            let gasUsedUsable = gasUsed.toString();
            await BorrowEventRepository.update({
              gas_used: gasUsedUsable,
              effective_gas_price: effectiveGasPrice.toString(),
              // usd_value_at_event_time: borrowValueUSD,
              // asset_price_at_event_time: closestPrice?.price ? closestPrice?.price : 0
            }, existingEventRecord.id);
          }
          // console.log({closestPrice, "borrow amount USD": borrowValueUSD, amount: utils.formatUnits(amount.toString(), assetRecord.decimals).toString(), asset});
        }
      }

      for(let depositEvent of depositEvents) {
        let {
          blockNumber,
          args,
          transactionIndex,
          logIndex,
        } = depositEvent;
        if(args && blockNumberToUnixTimestamp[blockNumber]) {
          let {
            asset,
            amount,
          } = args;
          // let closestPrice = await fetchCoinGeckoAssetPriceClosestToTargetTime(asset, network, blockNumberToUnixTimestamp[blockNumber]);
          // let assetRecord = await AssetRepository.findByColumn('address', asset);
          // let depositValueUSD = closestPrice?.price ? new BigNumber(Number(utils.formatUnits(amount.toString(), assetRecord.decimals))).multipliedBy(closestPrice?.price).toFixed(2) : 0;
          let eventFingerprint = getEventFingerprint(network, blockNumber, transactionIndex, logIndex);
          let existingEventRecord = await DepositEventRepository.findByColumn('event_fingerprint', eventFingerprint);
          if(existingEventRecord && !existingEventRecord.effective_gas_price) {
            let transactionReceipt = await depositEvent.getTransactionReceipt();
            let {
              gasUsed,
              effectiveGasPrice,
            } = transactionReceipt;
            let gasUsedUsable = gasUsed.toString();
            await DepositEventRepository.update({
              gas_used: gasUsedUsable,
              effective_gas_price: effectiveGasPrice.toString(),
              // usd_value_at_event_time: depositValueUSD,
              // asset_price_at_event_time: closestPrice?.price ? closestPrice?.price : 0
            }, existingEventRecord.id);
          }
          // console.log({closestPrice, "deposit amount USD": depositValueUSD, amount: utils.formatUnits(amount.toString(), assetRecord.decimals).toString(), asset});
        }
      }

      for(let repayEvent of repayEvents) {
        let {
          blockNumber,
          args,
          transactionIndex,
          logIndex,
        } = repayEvent;
        if(args && blockNumberToUnixTimestamp[blockNumber]) {
          let {
            asset,
            amount,
          } = args;
          // let closestPrice = await fetchCoinGeckoAssetPriceClosestToTargetTime(asset, network, blockNumberToUnixTimestamp[blockNumber]);
          // let assetRecord = await AssetRepository.findByColumn('address', asset);
          // let repayValueUSD = closestPrice?.price ? new BigNumber(Number(utils.formatUnits(amount.toString(), assetRecord.decimals))).multipliedBy(closestPrice?.price).toFixed(2) : 0;
          let eventFingerprint = getEventFingerprint(network, blockNumber, transactionIndex, logIndex);
          let existingEventRecord = await RepayEventRepository.findByColumn('event_fingerprint', eventFingerprint);
          if(existingEventRecord && !existingEventRecord.effective_gas_price) {
            let transactionReceipt = await repayEvent.getTransactionReceipt();
            let {
              gasUsed,
              effectiveGasPrice,
            } = transactionReceipt;
            let gasUsedUsable = gasUsed.toString();
            await RepayEventRepository.update({
              gas_used: gasUsedUsable,
              effective_gas_price: effectiveGasPrice.toString(),
              // usd_value_at_event_time: repayValueUSD,
              // asset_price_at_event_time: closestPrice?.price ? closestPrice?.price : 0
            }, existingEventRecord.id);
          }
          // console.log({closestPrice, "repay amount USD": repayValueUSD, amount: utils.formatUnits(amount.toString(), assetRecord.decimals).toString(), asset});
        }
      }

      for(let withdrawEvent of withdrawEvents) {
        let {
          blockNumber,
          args,
          transactionIndex,
          logIndex,
        } = withdrawEvent;
        if(args && blockNumberToUnixTimestamp[blockNumber]) {
          let {
            asset,
            amount,
          } = args;
          // let closestPrice = await fetchCoinGeckoAssetPriceClosestToTargetTime(asset, network, blockNumberToUnixTimestamp[blockNumber]);
          // let assetRecord = await AssetRepository.findByColumn('address', asset);
          // let withdrawValueUSD = closestPrice?.price ? new BigNumber(Number(utils.formatUnits(amount.toString(), assetRecord.decimals))).multipliedBy(closestPrice?.price).toFixed(2) : 0;
          let eventFingerprint = getEventFingerprint(network, blockNumber, transactionIndex, logIndex);
          let existingEventRecord = await WithdrawEventRepository.findByColumn('event_fingerprint', eventFingerprint);
          if(existingEventRecord && !existingEventRecord.effective_gas_price) {
            let transactionReceipt = await withdrawEvent.getTransactionReceipt();
            let {
              gasUsed,
              effectiveGasPrice,
            } = transactionReceipt;
            let gasUsedUsable = gasUsed.toString();
            await WithdrawEventRepository.update({
              gas_used: gasUsedUsable,
              effective_gas_price: effectiveGasPrice.toString(),
              // usd_value_at_event_time: withdrawValueUSD,
              // asset_price_at_event_time: closestPrice?.price ? closestPrice?.price : 0
            }, existingEventRecord.id);
          }
          // console.log({closestPrice, "withdraw amount USD": withdrawValueUSD, amount: utils.formatUnits(amount.toString(), assetRecord.decimals).toString(), asset});
        }
      }

      console.log(`Sanity event resync successful (${network} - ${deploymentConfig.id}), exec time: ${new Date().getTime() - startTime}ms`)

    } catch (e) {
      console.error(`Error encountered in sanity checker (${network} - ${deploymentConfig.id}) at ${useTimestampPostgres}, exec time: ${new Date().getTime() - startTime}ms, error: ${e}`)
    }

  }
}