import BigNumber from 'bignumber.js';

BigNumber.config({ EXPONENTIAL_AT: [-1e+9, 1e+9] });

import {
  getLatestBlockNumber,
  getAllSubgraphLiquidationsUntilBlock,
  getBlocks,
} from '../web3/jobs';

import {
  DEPLOYMENT_CONFIGS,
} from '../constants';

import {
  BlockMetadataRepository,
} from '../database/repositories';

export const periodicSubgraphLiquidationTracker = async (useTimestampUnix: number, startTime: number) => {

  let useTimestampPostgres = new Date(useTimestampUnix * 1000).toISOString();

  for(let deploymentConfig of DEPLOYMENT_CONFIGS) {

    let { network } = deploymentConfig;

    try {

      let latestBlockNumber = await getLatestBlockNumber(network);

      let liquidationRecords = await getAllSubgraphLiquidationsUntilBlock(latestBlockNumber, deploymentConfig);

      let allBlockNumbers : number[] = [];
      for(let record of liquidationRecords) {
        if(allBlockNumbers.indexOf(record.blockNumber) === -1) {
          allBlockNumbers.push(record.blockNumber);
        }
      }

      // Store timestamps for any blocks that we fetched events for
      let unfetchedBlockNumbers = [];
      let blockNumberToUnixTimestamp : {[key: string]: number} = {};
      for(let blockNumber of allBlockNumbers) {
        let currentRecord = await BlockMetadataRepository.getByBlockNumberAndNetwork(blockNumber, network);
        if(!currentRecord) {
          unfetchedBlockNumbers.push(Number(blockNumber));
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
            block_hash: singleBlockData.hash,
            block_day_timestamp: new Date(jsDate.getFullYear(), jsDate.getMonth(), jsDate.getDate()),
            network,
          })
        }
        console.log(`Filled in block metadata for ${blockData.length} blocks`);
      }
      
      console.log(`Periodic subgraph liquidation record tracker successful (${network} - ${deploymentConfig.id}), exec time: ${new Date().getTime() - startTime}ms`)

    } catch (e) {
      console.error(`Error encountered in periodicContractEventTracker (${network} - ${deploymentConfig.id}) at ${useTimestampPostgres}, exec time: ${new Date().getTime() - startTime}ms, error: ${e}`)
    }

  }
}