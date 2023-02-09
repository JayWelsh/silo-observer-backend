import { Contract, Event } from 'ethers';

import BigNumber from 'bignumber.js';

import {
  EthersProvider,
  EthersProviderArbitrum,
} from "../../app";

import {
  EventIndexerBlockTrackerRepository,
  DepositEventRepository,
} from '../../database/repositories';

import {
  eventIndexer
} from ".";

import {
  extractFromBlockToBlock
} from '../utils'

import SiloABI from '../abis/SiloABI.json';

BigNumber.config({ EXPONENTIAL_AT: [-1e+9, 1e+9] });

export const getAllSiloDepositEventsSinceBlock = async (
  siloAddresses: string [],
  lastestBlock: number,
  network: string,
) => {

  console.log("Initiating Deposit Event Tracker");

  let eventIndexBlockTrackerRecord = await EventIndexerBlockTrackerRepository.getByEventNameAndNetwork("Deposit", network);

  let {
    fromBlock,
    toBlock,
    blockRange,
  } = extractFromBlockToBlock(lastestBlock, eventIndexBlockTrackerRecord);

  // delete any records newer than latestBlock in case there was an incomplete run which occurred
  let deletedRecords = await DepositEventRepository.query().delete().where(function (this: any) {
    this.whereRaw(`block_number > ${fromBlock}`);
    this.where(`network`, network);
  });

  if(deletedRecords && (deletedRecords > 0)) {
    console.log(`Deleted ${deletedRecords} records with a block_number larger than ${fromBlock}`);
  }

  let siloProgress = 0;
  let totalRecordCount = 0;
  let allEvents : Event[] = [];
  let provider = EthersProvider;
  if(network === "arbitrum") {
    provider = EthersProviderArbitrum;
  }

  for(let siloAddress of siloAddresses) {
    siloProgress++
    const SiloContract = new Contract(siloAddress, SiloABI);
    const siloContract = await SiloContract.connect(provider);
    const depositEventFilter = await siloContract.filters.Deposit(null, null);

    let events = await eventIndexer(siloContract, depositEventFilter, lastestBlock, fromBlock, toBlock, blockRange, network, `${siloAddress} (Deposit) - silo ${siloProgress} of ${siloAddresses.length}`);
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
          amount,
          collateralOnly,
        } = args;
        // create event record
        DepositEventRepository.create({
          silo_address: address,
          asset_address: asset,
          user_address: user,
          collateral_only: collateralOnly,
          amount: amount.toString(),
          tx_hash: transactionHash,
          block_number: blockNumber,
          network,
        })
      }
    }

  }

  console.log(`Fetched ${totalRecordCount} Deposit events across all silos`);

  await EventIndexerBlockTrackerRepository.update({
    last_checked_block: lastestBlock,
  }, eventIndexBlockTrackerRecord.id)

  return allEvents ? allEvents : []

}