import BigNumber from 'bignumber.js';

BigNumber.config({ EXPONENTIAL_AT: [-1e+9, 1e+9] });

import {
  getLatestBlockNumber,
  getAllSubgraphLiquidationsUntilBlock,
} from '../web3/jobs';

import {
  DEPLOYMENT_CONFIGS,
} from '../constants';

export const periodicSubgraphLiquidationTracker = async (useTimestampUnix: number, startTime: number) => {

  let useTimestampPostgres = new Date(useTimestampUnix * 1000).toISOString();

  for(let deploymentConfig of DEPLOYMENT_CONFIGS) {

    let { network } = deploymentConfig;

    try {

      let latestBlockNumber = await getLatestBlockNumber(network);

      await getAllSubgraphLiquidationsUntilBlock(latestBlockNumber, deploymentConfig);
      
      console.log(`Periodic subgraph liquidation record tracker successful (${network} - ${deploymentConfig.id}), exec time: ${new Date().getTime() - startTime}ms`)

    } catch (e) {
      console.error(`Error encountered in periodicContractEventTracker (${network} - ${deploymentConfig.id}) at ${useTimestampPostgres}, exec time: ${new Date().getTime() - startTime}ms, error: ${e}`)
    }

  }
}