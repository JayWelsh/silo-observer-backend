import { Contract, Event } from 'ethers';

import BigNumber from 'bignumber.js';

import {
  EthersProvider,
  EthersProviderArbitrum,
} from "../../app";

import {
  EventIndexerBlockTrackerRepository,
  BorrowEventRepository,
} from '../../database/repositories';

import {
  eventIndexer
} from ".";

import {
  extractFromBlockToBlock
} from '../utils'

import {
  IDeployment,
} from '../../interfaces';

import SiloABI from '../abis/SiloABI.json';

BigNumber.config({ EXPONENTIAL_AT: [-1e+9, 1e+9] });

export const getAllSiloBorrowEventsSinceBlock = async (
  siloAddresses: string [],
  lastestBlock: number,
  deploymentConfig: IDeployment,
) => {

  console.log("Initiating Borrow Event Tracker");

  let network = deploymentConfig.network;
  let deploymentId = deploymentConfig.id;

  let eventIndexBlockTrackerRecord = await EventIndexerBlockTrackerRepository.getByEventNameAndNetwork("Borrow", network, deploymentId);

  let {
    fromBlock,
    toBlock,
    blockRange,
  } = extractFromBlockToBlock(lastestBlock, eventIndexBlockTrackerRecord);

  // delete any records newer than latestBlock in case there was an incomplete run which occurred
  let deletedRecords = await BorrowEventRepository.query().delete().where(function (this: any) {
    this.whereRaw(`block_number > ${fromBlock}`);
    this.where(`network`, network);
    this.where(`deployment_id`, deploymentId);
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
    const borrowEventFilter = await siloContract.filters.Borrow(null, null);

    let events = await eventIndexer(siloContract, borrowEventFilter, lastestBlock, fromBlock, toBlock, blockRange, network, `${siloAddress} (Borrow) - silo ${siloProgress} of ${siloAddresses.length}`);
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
          user,
          amount,
        } = args;
        // create event record
        BorrowEventRepository.create({
          silo_address: address,
          asset_address: asset,
          user_address: user,
          amount: amount.toString(),
          tx_hash: transactionHash,
          block_number: blockNumber,
          network,
          deployment_id: deploymentId,
        })
      }
    }

  }

  console.log(`Fetched ${totalRecordCount} Borrow events across all silos`);

  await EventIndexerBlockTrackerRepository.update({
    last_checked_block: lastestBlock,
  }, eventIndexBlockTrackerRecord.id)

  return allEvents ? allEvents : []

}