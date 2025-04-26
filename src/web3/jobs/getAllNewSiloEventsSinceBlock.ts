import { Contract, Event } from 'ethers';

import BigNumber from 'bignumber.js';

import {
  EthersProvider,
  EthersProviderArbitrum,
  EthersProviderOptimism,
  EthersProviderBase,
  EthersProviderSonic,
} from "../../app";

import {
  EventIndexerBlockTrackerRepository,
  NewSiloEventRepository,
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

import SiloFactoryABI from '../abis/SiloFactoryABI.json';
import SiloFactoryV2ABI from '../abis/SiloFactoryV2ABI.json';

BigNumber.config({ EXPONENTIAL_AT: [-1e+9, 1e+9] });

export const getAllNewSiloEventsSinceBlock = async (
  lastestBlock: number,
  deploymentConfig: IDeployment,
  isSanityCheck?: boolean,
) => {

  console.log("Initiating NewSilo Event Tracker");

  let network = deploymentConfig.network;
  let protocolVersion = deploymentConfig.protocolVersion;
  let eventName;
  if(protocolVersion === 1) {
    eventName = "NewSiloCreated";
  } else if (protocolVersion === 2) {
    eventName = "NewSilo";
  } else {
    return [];
  }

  let allEvents : Event[] = [];

  let siloFactoryProgress = 0;
  for(let siloFactory of deploymentConfig.siloFactories) {
    siloFactoryProgress++

    let deploymentId = siloFactory.meta;

    let eventIndexBlockTrackerRecord = await EventIndexerBlockTrackerRepository.getByEventNameAndNetwork(eventName, network, deploymentId);
    if(isSanityCheck) {
      eventIndexBlockTrackerRecord = await EventIndexerBlockTrackerRepository.getByEventNameAndNetwork(eventName, network, deploymentId);
    }

    console.log({eventIndexBlockTrackerRecord})

    if(!eventIndexBlockTrackerRecord && eventName) {
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
      let deletedRecords = await NewSiloEventRepository.query().delete().where(function (this: any) {
        this.whereRaw(`block_number >= ${fromBlock}`);
        this.where(`network`, network);
        this.where(`deployment_id`, deploymentId);
      });

      if(deletedRecords && (deletedRecords > 0)) {
        console.log(`Deleted ${deletedRecords} records with a block_number larger than ${fromBlock}`);
      }
    }

    let totalRecordCount = 0;

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
      }

      if(deploymentConfig.protocolVersion === 1) {

        const SiloFactoryContract = new Contract(siloFactory.address, SiloFactoryABI);
        const siloFactoryContract = await SiloFactoryContract.connect(provider);
        const newSiloEventFilter = await siloFactoryContract.filters.NewSiloCreated(null, null);

        let events = await eventIndexer(siloFactoryContract, newSiloEventFilter, lastestBlock, fromBlock, toBlock, blockRange, network, `${siloFactory.address} - isSanityCheck: ${isSanityCheck} - (NewSiloCreated V1) - silo factory ${siloFactoryProgress} of ${deploymentConfig.siloFactories.length}`);
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
              silo,
              version,
            } = args;
            // create event record
            let eventFingerprint = getEventFingerprint(network, blockNumber, transactionIndex, logIndex);
            let existingEventRecord = await NewSiloEventRepository.findByColumn('event_fingerprint', eventFingerprint);
            console.log({
              protocol_version: deploymentConfig.protocolVersion,
              silo: silo,
              asset: asset,
              version: version,
              tx_hash: transactionHash,
              block_number: blockNumber,
              event_fingerprint: eventFingerprint,
              log_index: logIndex,
              tx_index: transactionIndex,
              deployment_id: deploymentId,
              network,
            })
            if(!existingEventRecord) {
              await NewSiloEventRepository.create({
                silo_factory: siloFactory.address,
                protocol_version: deploymentConfig.protocolVersion,
                silo: silo,
                asset: asset,
                version: version,
                tx_hash: transactionHash,
                block_number: blockNumber,
                event_fingerprint: eventFingerprint,
                log_index: logIndex,
                tx_index: transactionIndex,
                deployment_id: deploymentId,
                network,
              })
            }
          }
        }

      } else if(deploymentConfig.protocolVersion === 2) {

        const SiloFactoryContract = new Contract(siloFactory.address, SiloFactoryV2ABI);
        const siloFactoryContract = await SiloFactoryContract.connect(provider);
        const newSiloEventFilter = await siloFactoryContract.filters.NewSilo(null, null, null);

        let events = await eventIndexer(siloFactoryContract, newSiloEventFilter, lastestBlock, fromBlock, toBlock, blockRange, network, `${siloFactory.address} - isSanityCheck: ${isSanityCheck} - (NewSilo V2) - silo factory ${siloFactoryProgress} of ${deploymentConfig.siloFactories.length}`);
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
              implementation,
              token0,
              token1,
              silo0,
              silo1,
              siloConfig,
            } = args;
            // create event record
            let eventFingerprint = getEventFingerprint(network, blockNumber, transactionIndex, logIndex);
            let existingEventRecord = await NewSiloEventRepository.findByColumn('event_fingerprint', eventFingerprint);
            if(!existingEventRecord) {
              console.log({
                protocol_version: deploymentConfig.protocolVersion,
                silo_factory: siloFactory.address,
                implementation: implementation,
                token0: token0,
                token1: token1,
                silo0: silo0,
                silo1: silo1,
                // deployer: deployer,
                silo_config: siloConfig,
                tx_hash: transactionHash,
                block_number: blockNumber,
                event_fingerprint: eventFingerprint,
                log_index: logIndex,
                tx_index: transactionIndex,
                deployment_id: deploymentId,
                network,
              })
              await NewSiloEventRepository.create({
                protocol_version: deploymentConfig.protocolVersion,
                silo_factory: siloFactory.address,
                implementation: implementation,
                token0: token0,
                token1: token1,
                silo0: silo0,
                silo1: silo1,
                // deployer: deployer,
                silo_config: siloConfig,
                tx_hash: transactionHash,
                block_number: blockNumber,
                event_fingerprint: eventFingerprint,
                log_index: logIndex,
                tx_index: transactionIndex,
                deployment_id: deploymentId,
                network,
              })
            }
          }
        }

      }

      console.log(`Fetched ${totalRecordCount} NewSilo events across all silos`);

      await EventIndexerBlockTrackerRepository.update({
        last_checked_block: latestSyncBlock,
      }, eventIndexBlockTrackerRecord.id);

    }

  }

  return allEvents ? allEvents : []

}