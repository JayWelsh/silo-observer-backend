import { Contract, Event, utils } from 'ethers';

import BigNumber from 'bignumber.js';

import {
  SubgraphIndexerBlockTrackerRepository,
  SubgraphLiquidationRecordRepository,
} from '../../database/repositories';

import {
  subgraphIndexer
} from ".";

import {
  extractFromBlockToBlock,
} from '../utils'

import {
  IDeployment,
} from '../../interfaces';

import { subgraphRequestWithRetry } from '../../utils';

BigNumber.config({ EXPONENTIAL_AT: [-1e+9, 1e+9] });

const buildQuery = (
  blockNumberStart: number,
  blockNumberEnd: number,
  first: number = 0,
  skip: number = 0,
) => {
  // replace market.id with silo.id when upgrading to latest pending subgraph
  return `{
    liquidates(
      where:{amount_gt: 0, blockNumber_gte: ${blockNumberStart}, blockNumber_lte: ${blockNumberEnd}}
      orderBy: timestamp,
      orderDirection: desc,
      first: ${first},
      skip: ${skip},
    ){
      id
      blockNumber
      logIndex
      market {
        id
      }
      asset {
        id
      }
      amount
      amountUSD
      profitUSD
      liquidator { id }
      liquidatee { id }
      hash
      timestamp
    }
  }`
}

export const getAllSubgraphLiquidationsUntilBlock = async (
  latestBlock: number,
  deploymentConfig: IDeployment,
  isSanityCheck?: boolean,
) => {

  console.log("Initiating Subgraph Liquidations Tracker");

  let query = `{
    _meta {
      block {
        number
      }
    }
  }`
  console.log("Getting latest block synced by subgraph");
  let latestSubgraphMeta = await subgraphRequestWithRetry(query, deploymentConfig.subgraphEndpoint);
  let latestLiquidationBlockNumber = latestSubgraphMeta?.data?._meta?.block?.number ? latestSubgraphMeta?.data?._meta?.block?.number : 0;

  let network = deploymentConfig.network;
  let deploymentId = deploymentConfig.id;

  let subgraphIndexBlockTrackerRecord = await SubgraphIndexerBlockTrackerRepository.getByRecordTypeAndNetwork("Liquidation", network, deploymentId);
  if(isSanityCheck) {
    subgraphIndexBlockTrackerRecord = await SubgraphIndexerBlockTrackerRepository.getByRecordTypeAndNetwork("Liquidation-Sanity", network, deploymentId);
  }

  if(!subgraphIndexBlockTrackerRecord) {
    return [];
  }

  let {
    fromBlock,
    toBlock,
    blockRange,
  } = extractFromBlockToBlock(latestBlock, subgraphIndexBlockTrackerRecord, true);

  let latestSyncBlock = new BigNumber(toBlock).isLessThanOrEqualTo(latestLiquidationBlockNumber) ? toBlock : latestLiquidationBlockNumber;

  // if(!isSanityCheck) {
  //   // delete any records newer than latestBlock in case there was an incomplete run which occurred
  //   let deletedRecords = await BorrowEventRepository.query().delete().where(function (this: any) {
  //     this.whereRaw(`block_number >= ${fromBlock}`);
  //     this.where(`network`, network);
  //     this.where(`deployment_id`, deploymentId);
  //   });

  //   if(deletedRecords && (deletedRecords > 0)) {
  //     console.log(`Deleted ${deletedRecords} records with a block_number larger than ${fromBlock}`);
  //   }
  // }

  let totalRecordCount = 0;
  let allSubgraphLiquidations : Event[] = [];

  if(blockRange > 1) {

    let subgraphLiquidations = await subgraphIndexer(deploymentConfig.subgraphEndpoint, buildQuery, latestBlock, fromBlock, toBlock, blockRange, network, `${deploymentConfig.idHumanReadable} - isSanityCheck: ${isSanityCheck} - (Subgraph Liquidations)`);

    totalRecordCount += (subgraphLiquidations && (subgraphLiquidations?.length > 0)) ? subgraphLiquidations?.length : 0;

    console.log({totalRecordCount});

    if(subgraphLiquidations) {
      allSubgraphLiquidations = [...allSubgraphLiquidations, ...subgraphLiquidations];
      for(let liquidation of subgraphLiquidations) {
        if(new BigNumber(liquidation.blockNumber).isGreaterThan(latestSyncBlock)) {
          latestSyncBlock = liquidation.blockNumber;
        }

        let {
          id: recordFingerprint,
          blockNumber,
          market: {
            id: siloAddress,
          },
          asset: {
            id: assetAddress
          },
          amount,
          amountUSD,
          profitUSD,
          liquidator: {
            id: liquidatorAddress,
          },
          liquidatee: {
            id: liquidateeAddress,
          },
          hash: transactionHash,
          timestamp
        } = liquidation;

        let existingLiquidationRecord = await SubgraphLiquidationRecordRepository.findByColumn('record_fingerprint', recordFingerprint);
        if(!existingLiquidationRecord) {
          SubgraphLiquidationRecordRepository.create({
            record_fingerprint: recordFingerprint,
            block_number: blockNumber,
            silo_address: utils.getAddress(siloAddress),
            asset_address: utils.getAddress(assetAddress),
            liquidator: utils.getAddress(liquidatorAddress),
            liquidatee: utils.getAddress(liquidateeAddress),
            amount: amount.toString(),
            amount_usd: amountUSD.toString(),
            profit_usd: profitUSD.toString(),
            tx_hash: transactionHash,
            network,
            deployment_id: deploymentId,
            timestamp_unix: timestamp,
          })
        } else {
          SubgraphLiquidationRecordRepository.update({
            record_fingerprint: recordFingerprint,
            block_number: blockNumber,
            silo_address: utils.getAddress(siloAddress),
            asset_address: utils.getAddress(assetAddress),
            liquidator: utils.getAddress(liquidatorAddress),
            liquidatee: utils.getAddress(liquidateeAddress),
            amount: amount.toString(),
            amount_usd: amountUSD.toString(),
            profit_usd: profitUSD.toString(),
            tx_hash: transactionHash,
            network,
            deployment_id: deploymentId,
            timestamp_unix: timestamp,
          }, existingLiquidationRecord.id);
        }
      }
    }

    console.log(`Fetched ${totalRecordCount} Subgraph Liquidations`);

    await SubgraphIndexerBlockTrackerRepository.update({
      last_checked_block: latestSyncBlock,
    }, subgraphIndexBlockTrackerRecord.id)

  }

  return allSubgraphLiquidations ? allSubgraphLiquidations : []

}