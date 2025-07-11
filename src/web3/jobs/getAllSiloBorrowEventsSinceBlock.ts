import { Contract, Event } from 'ethers';

import BigNumber from 'bignumber.js';

import {
  EthersProvider,
  EthersProviderArbitrum,
  EthersProviderOptimism,
  EthersProviderBase,
  EthersProviderSonic,
  EthersProviderAvalanche,
} from "../../app";

import {
  EventIndexerBlockTrackerRepository,
  BorrowEventRepository,
  SiloRepository,
} from '../../database/repositories';

import {
  eventIndexer
} from ".";

import {
  extractFromBlockToBlock,
  getEventFingerprint,
} from '../utils'

import {
  IDeployment,
} from '../../interfaces';

import SiloABI from '../abis/SiloABI.json';
import SiloV2ABI from '../abis/SiloV2ABI.json';

BigNumber.config({ EXPONENTIAL_AT: [-1e+9, 1e+9] });

export const getAllSiloBorrowEventsSinceBlock = async (
  siloAddresses: string [],
  lastestBlock: number,
  deploymentConfig: IDeployment,
  isSanityCheck?: boolean,
) => {

  console.log("Initiating Borrow Event Tracker");

  let network = deploymentConfig.network;
  let deploymentId = deploymentConfig.id;

  let eventIndexBlockTrackerRecord = await EventIndexerBlockTrackerRepository.getByEventNameAndNetwork("Borrow", network, deploymentId);
  if(isSanityCheck) {
    eventIndexBlockTrackerRecord = await EventIndexerBlockTrackerRepository.getByEventNameAndNetwork("Borrow-Sanity", network, deploymentId);
  }

  if(!eventIndexBlockTrackerRecord) {
    return [];
  }

  let {
    fromBlock,
    toBlock,
    blockRange,
  } = extractFromBlockToBlock(lastestBlock, eventIndexBlockTrackerRecord);

  let latestSyncBlock = toBlock;

  if(!isSanityCheck) {
    // delete any records newer than latestBlock in case there was an incomplete run which occurred
    let deletedRecords = await BorrowEventRepository.query().delete().where(function (this: any) {
      this.whereRaw(`block_number >= ${fromBlock}`);
      this.where(`network`, network);
      this.where(`deployment_id`, deploymentId);
    });

    if(deletedRecords && (deletedRecords > 0)) {
      console.log(`Deleted ${deletedRecords} records with a block_number larger than ${fromBlock}`);
    }
  }

  let siloProgress = 0;
  let totalRecordCount = 0;
  let allEvents : Event[] = [];

  if(blockRange > 1) {

    let provider = EthersProvider;
    if(network === "arbitrum") {
      provider = EthersProviderArbitrum;
    } else if(network === "optimism") {
      provider = EthersProviderOptimism;
    } else if (network === "base") {
      provider = EthersProviderBase;
    } else if (network === "sonic") {
      provider = EthersProviderSonic;
    } else if (network === "avalanche") {
      provider = EthersProviderAvalanche;
    }

    for(let siloAddress of siloAddresses) {
      siloProgress++

      if(deploymentConfig.protocolVersion === 1) {

        const SiloContract = new Contract(siloAddress, SiloABI);
        const siloContract = await SiloContract.connect(provider);
        const borrowEventFilter = await siloContract.filters.Borrow(null, null);

        let events = await eventIndexer(siloContract, borrowEventFilter, lastestBlock, fromBlock, toBlock, blockRange, network, `${siloAddress} - isSanityCheck: ${isSanityCheck} - (Borrow V1) - silo ${siloProgress} of ${siloAddresses.length}`);
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
              transactionIndex,
              logIndex,
            } = event;
            let {
              asset,
              user,
              amount,
            } = args;
            // create event record
            let eventFingerprint = getEventFingerprint(network, blockNumber, transactionIndex, logIndex);
            let existingEventRecord = await BorrowEventRepository.findByColumn('event_fingerprint', eventFingerprint);
            if(!existingEventRecord) {
              await BorrowEventRepository.create({
                silo_address: address,
                asset_address: asset,
                user_address: user,
                amount: amount.toString(),
                tx_hash: transactionHash,
                block_number: blockNumber,
                network,
                deployment_id: deploymentId,
                event_fingerprint: eventFingerprint,
                log_index: logIndex,
                tx_index: transactionIndex,
                protocol_version: deploymentConfig.protocolVersion,
              })
            }
          }
        }

      } else if(deploymentConfig.protocolVersion === 2) {

        const SiloContract = new Contract(siloAddress, SiloV2ABI);
        const siloContract = await SiloContract.connect(provider);
        const borrowEventFilter = await siloContract.filters.Borrow(null, null, null);

        let siloRecord = await SiloRepository.getSiloByAddress(siloAddress, deploymentConfig.id);

        if(siloRecord) {
          let events = await eventIndexer(siloContract, borrowEventFilter, lastestBlock, fromBlock, toBlock, blockRange, network, `${siloAddress} - isSanityCheck: ${isSanityCheck} - (Borrow V2) - silo ${siloProgress} of ${siloAddresses.length}`);
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
                transactionIndex,
                logIndex,
              } = event;
              let {
                sender,
                receiver,
                owner,
                assets,
                shares
              } = args;
              // console.log({siloRecord})
              let assetAddress = siloRecord.input_token_address;
              // create event record
              let eventFingerprint = getEventFingerprint(network, blockNumber, transactionIndex, logIndex);
              let existingEventRecord = await BorrowEventRepository.findByColumn('event_fingerprint', eventFingerprint);
              if(!existingEventRecord) {
                await BorrowEventRepository.create({
                  silo_address: address,
                  asset_address: assetAddress,
                  user_address: owner,
                  amount: assets.toString(),
                  tx_hash: transactionHash,
                  block_number: blockNumber,
                  network,
                  deployment_id: deploymentId,
                  event_fingerprint: eventFingerprint,
                  log_index: logIndex,
                  tx_index: transactionIndex,
                  protocol_version: deploymentConfig.protocolVersion,
                  sender,
                  receiver,
                  owner,
                  assets: assets.toString(),
                  shares: shares.toString(),
                })
              }
            }
          }

        }

      }

    }

    console.log(`Fetched ${totalRecordCount} Borrow events across all silos`);

    await EventIndexerBlockTrackerRepository.update({
      last_checked_block: latestSyncBlock,
    }, eventIndexBlockTrackerRecord.id)

  }

  return allEvents ? allEvents : []

}