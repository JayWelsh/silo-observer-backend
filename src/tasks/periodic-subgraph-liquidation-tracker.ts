import BigNumber from 'bignumber.js';

BigNumber.config({ EXPONENTIAL_AT: [-1e+9, 1e+9] });

import {
  getLatestBlockNumber,
  getAllSubgraphLiquidationsUntilBlockV1,
  getBlocks,
} from '../web3/jobs';

import {
  DEPLOYMENT_CONFIGS,
} from '../constants';

import {
  BlockMetadataRepository,
} from '../database/repositories';

import {
  IDeploymentV1,
} from '../interfaces';

export const periodicSubgraphLiquidationTracker = async (useTimestampUnix: number, startTime: number) => {

  let deploymentConfigsV1: IDeploymentV1[] = DEPLOYMENT_CONFIGS.filter((entry): entry is IDeploymentV1 => entry.protocolVersion === 1);

  let useTimestampPostgres = new Date(useTimestampUnix * 1000).toISOString();

  for(let deploymentConfig of deploymentConfigsV1) {

    let { network } = deploymentConfig;

    try {

      let latestBlockNumber = await getLatestBlockNumber(network);

      if(deploymentConfig.protocolVersion === 1) {

        let liquidationRecords = await getAllSubgraphLiquidationsUntilBlockV1(latestBlockNumber, deploymentConfig);

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

      }
      
      console.log(`Periodic subgraph liquidation record tracker successful (${network} - ${deploymentConfig.id}), exec time: ${new Date().getTime() - startTime}ms`)

    } catch (e) {
      console.error(`Error encountered in periodicContractEventTracker (${network} - ${deploymentConfig.id}) at ${useTimestampPostgres}, exec time: ${new Date().getTime() - startTime}ms, error: ${e}`)
    }

  }
}