import { Contract, Event } from 'ethers';

import BigNumber from 'bignumber.js';

import {
  EthersProvider,
  EthersProviderArbitrum,
  EthersProviderOptimism,
} from "../../app";

import {
  EventIndexerBlockTrackerRepository,
  RewardEventRepository,
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

import ArbIncentivesControllerABI from '../abis/ArbIncentivesControllerABI.json';

BigNumber.config({ EXPONENTIAL_AT: [-1e+9, 1e+9] });

export const getAllRewardsClaimedEventsSinceBlock = async (
  incentiveControllerAddress: string,
  incentiveAssetAddress: string,
  lastestBlock: number,
  deploymentConfig: IDeployment,
  isSanityCheck?: boolean,
) => {

  console.log("Initiating RewardsClaimed Event Tracker");

  let network = deploymentConfig.network;
  let deploymentId = deploymentConfig.id;

  let eventIndexBlockTrackerRecord = await EventIndexerBlockTrackerRepository.getByEventNameAndNetwork("RewardsClaimed", network, deploymentId);
  if(isSanityCheck) {
    eventIndexBlockTrackerRecord = await EventIndexerBlockTrackerRepository.getByEventNameAndNetwork("RewardsClaimed-Sanity", network, deploymentId);
  }

  if(eventIndexBlockTrackerRecord) {

    let {
      fromBlock,
      toBlock,
      blockRange,
    } = extractFromBlockToBlock(lastestBlock, eventIndexBlockTrackerRecord);

    let latestSyncBlock = toBlock;

    if(!isSanityCheck) {
      // delete any records newer than latestBlock in case there was an incomplete run which occurred
      let deletedRecords = await RewardEventRepository.query().delete().where(function (this: any) {
        this.whereRaw(`block_number >= ${fromBlock}`);
        this.where(`network`, network);
        this.where(`deployment_id`, deploymentId);
        this.where(`incentive_controller_address`, incentiveControllerAddress);
      });

      if(deletedRecords && (deletedRecords > 0)) {
        console.log(`Deleted ${deletedRecords} records with a block_number larger than ${fromBlock}`);
      }
    }

    let totalRecordCount = 0;
    let allEvents : Event[] = [];

    if(blockRange > 1) {

      let provider = EthersProvider;
      if(network === "arbitrum") {
        provider = EthersProviderArbitrum;
      } else if (network === "optimism") {
        provider = EthersProviderOptimism;
      }
      
      const IncentivesControllerContract = new Contract(incentiveControllerAddress, ArbIncentivesControllerABI);
      const incentivesControllerContract = await IncentivesControllerContract.connect(provider);
      const rewardsClaimedEventFilter = await incentivesControllerContract.filters.RewardsClaimed(null, null, null);

      let events = await eventIndexer(incentivesControllerContract, rewardsClaimedEventFilter, lastestBlock, fromBlock, toBlock, blockRange, network, `${incentiveControllerAddress} - isSanityCheck: ${isSanityCheck} - (RewardsClaimed)`);
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
            user,
            amount,
          } = args;
          // create event record
          let eventFingerprint = getEventFingerprint(network, blockNumber, transactionIndex, logIndex);
          let existingEventRecord = await RewardEventRepository.findByColumn('event_fingerprint', eventFingerprint);
          if(!existingEventRecord) {
            RewardEventRepository.create({
              event_name: "RewardsClaimed",
              incentive_controller_address: address,
              asset_address: incentiveAssetAddress,
              user_address: user,
              amount: amount.toString(),
              tx_hash: transactionHash,
              block_number: blockNumber,
              network,
              deployment_id: deploymentId,
              event_fingerprint: eventFingerprint,
              log_index: logIndex,
              tx_index: transactionIndex,
            })
          }
        }
      }

      console.log(`Fetched ${totalRecordCount} RewardsClaimed events`);

      await EventIndexerBlockTrackerRepository.update({
        last_checked_block: latestSyncBlock,
      }, eventIndexBlockTrackerRecord.id)

    }

    return allEvents ? allEvents : []

  }

  return [];

}