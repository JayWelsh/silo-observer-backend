import { Contract, Event } from 'ethers';

import BigNumber from 'bignumber.js';

import {
  EthersProvider,
} from "../../app";

import {
  EventIndexerBlockTrackerRepository,
  WithdrawEventRepository,
} from '../../database/repositories';

import {
  eventIndexer
} from ".";

import {
  extractFromBlockToBlock
} from '../utils'

import SiloABI from '../abis/SiloABI.json';

BigNumber.config({ EXPONENTIAL_AT: [-1e+9, 1e+9] });

export const getAllSiloWithdrawEventsSinceBlock = async (
  siloAddresses: string [],
  lastestBlock: number
) => {

  console.log("Initiating Withdraw Event Tracker");

  let eventIndexBlockTrackerRecord = await EventIndexerBlockTrackerRepository.findByColumn("event_name", "Withdraw");

  let {
    fromBlock,
    toBlock,
    blockRange,
  } = extractFromBlockToBlock(lastestBlock, eventIndexBlockTrackerRecord);

  // delete any records newer than latestBlock in case there was an incomplete run which occurred
  let deletedRecords = await WithdrawEventRepository.query().delete().where(function (this: any) {
    this.whereRaw(`block_number > ${fromBlock}`);
  });

  if(deletedRecords && (deletedRecords > 0)) {
    console.log(`Deleted ${deletedRecords} records with a block_number larger than ${fromBlock}`);
  }

  let siloProgress = 0;
  let totalRecordCount = 0;
  let allEvents : Event[] = [];
  for(let siloAddress of siloAddresses) {
    siloProgress++
    const SiloContract = new Contract(siloAddress, SiloABI);
    const siloContract = await SiloContract.connect(EthersProvider);
    const withdrawEventFilter = await siloContract.filters.Withdraw(null, null, null);

    let events = await eventIndexer(siloContract, withdrawEventFilter, lastestBlock, fromBlock, toBlock, blockRange, `${siloAddress} (Withdraw) - silo ${siloProgress} of ${siloAddresses.length}`);
    if(events) {
      allEvents = [...allEvents, ...events];
    }

    totalRecordCount += (events && (events?.length > 0)) ? events?.length : 0;

    if(events) {
      for(let event of events) {
        let {
          blockNumber,
          address,
          args,
          transactionHash,
        } = event;
        let {
          asset,
          depositor: user,
          receiver,
          amount,
        } = args;
        // create event record
        WithdrawEventRepository.create({
          silo_address: address,
          asset_address: asset,
          user_address: user,
          receiver_address: receiver,
          amount: amount.toString(),
          tx_hash: transactionHash,
          block_number: blockNumber,
        })
      }
    }
  }

  console.log(`Fetched ${totalRecordCount} Withdraw events across all silos`);

  await EventIndexerBlockTrackerRepository.update({
    last_checked_block: lastestBlock,
  }, eventIndexBlockTrackerRecord.id)

  return allEvents ? allEvents : []

}