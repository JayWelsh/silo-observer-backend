import BigNumber from 'bignumber.js';
import { raw } from 'objection';

import { Event } from 'ethers';

BigNumber.config({ EXPONENTIAL_AT: [-1e+9, 1e+9] });

import {
  getLatestBlockNumber,
  getAllSiloAddresses,
  getAllSiloBorrowEventsSinceBlock,
  getAllSiloDepositEventsSinceBlock,
  getAllSiloRepayEventsSinceBlock,
  getAllSiloWithdrawEventsSinceBlock,
  getBlocks,
} from '../web3/jobs';

import {
  SiloUserRepository,
  BorrowEventRepository,
  DepositEventRepository,
  WithdrawEventRepository,
  RepayEventRepository,
  BlockMetadataRepository,
} from '../database/repositories'

import {
  NETWORKS,
} from '../constants';

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

  for(let network of NETWORKS) {

    try {

      let latestBlockNumber = await getLatestBlockNumber(network);

      let siloAddresses = await getAllSiloAddresses(network);

      let [...eventBatches] = await Promise.all([
        getAllSiloBorrowEventsSinceBlock(siloAddresses, latestBlockNumber, network),
        getAllSiloDepositEventsSinceBlock(siloAddresses, latestBlockNumber, network),
        getAllSiloRepayEventsSinceBlock(siloAddresses, latestBlockNumber, network),
        getAllSiloWithdrawEventsSinceBlock(siloAddresses, latestBlockNumber, network),
      ])

      let allEvents = eventBatches.reduce((acc: Event[], value: Event[]) => {
        return [...acc, ...value];
      }, []);

      let allBlockNumbers : number[] = [];
      for(let event of allEvents) {
        if(allBlockNumbers.indexOf(event.blockNumber) === -1) {
          allBlockNumbers.push(event.blockNumber);
        }
      }

      // Store timestamps for any blocks that we fetched events for
      let unfetchedBlockNumbers = [];
      for(let blockNumber of allBlockNumbers) {
        let currentRecord = await BlockMetadataRepository.getByBlockNumberAndNetwork(blockNumber, network);
        if(!currentRecord) {
          unfetchedBlockNumbers.push(blockNumber);
        }
      }

      if(unfetchedBlockNumbers && unfetchedBlockNumbers.length > 0) {
        let blockData = await getBlocks(unfetchedBlockNumbers, network);
        for(let singleBlockData of blockData) {
          let jsDate = new Date(singleBlockData.timestamp * 1000);
          await BlockMetadataRepository.create({
            block_number: singleBlockData.number,
            block_timestamp_unix: singleBlockData.timestamp,
            block_timestamp: jsDate.toISOString(),
            block_day_timestamp: new Date(jsDate.getFullYear(), jsDate.getMonth(), jsDate.getDate()),
            network,
          })
        }
        console.log(`Filled in block metadata for ${blockData.length} blocks`);
      }

      // Get interaction count totals for each event grouped by user address
      let userAddressToBorrowEventCount = await BorrowEventRepository.query().select(raw(`user_address, count(*)`)).groupBy('user_address').orderBy('count', 'DESC');
      let userAddressToDepositEventCount = await DepositEventRepository.query().select(raw(`user_address, count(*)`)).groupBy('user_address').orderBy('count', 'DESC');
      let userAddressToRepayEventCount = await RepayEventRepository.query().select(raw(`user_address, count(*)`)).groupBy('user_address').orderBy('count', 'DESC');
      let userAddressToWithdrawEventCount = await WithdrawEventRepository.query().select(raw(`user_address, count(*)`)).groupBy('user_address').orderBy('count', 'DESC');

      let userAddressToEventCountBatches = [userAddressToBorrowEventCount, userAddressToDepositEventCount, userAddressToRepayEventCount, userAddressToWithdrawEventCount];

      // Rebuild interaction counts
      let userAddressToInteractionCount : IUserAddressToCount = {};

      for(let userAddressToEventCountBatch of userAddressToEventCountBatches) {
        for(let entry of userAddressToEventCountBatch) {
          const {
            user_address,
            count,
          } = entry;
          if(userAddressToInteractionCount[user_address]) {
            userAddressToInteractionCount[user_address] = userAddressToInteractionCount[user_address] + Number(count);
          } else {
            userAddressToInteractionCount[user_address] = Number(count);
          }
        }
      }

      console.log("Updating user interaction counts");

      // Set user interaction counts
      for(let entry of Object.entries(userAddressToInteractionCount)) {
        let user = entry[0];
        let count = entry[1];
        // check if user record exists
        let userRecord = await SiloUserRepository.findByColumn("address", user);
        if(!userRecord) {
          // create user record
          await SiloUserRepository.create({
            address: user,
            interaction_count: count,
          })
        } else {
          // increment interaction count
          await SiloUserRepository.update({
            interaction_count: count,
          }, userRecord.id)
        }
      }

      console.log(`Periodic contract event tracker successful (${network}), exec time: ${new Date().getTime() - startTime}ms`)

    } catch (e) {
      console.error(`Error encountered in periodicContractEventTracker (${network}) at ${useTimestampPostgres}, exec time: ${new Date().getTime() - startTime}ms, error: ${e}`)
    }

  }
}