import { validationResult } from "express-validator";
import e, { Request, Response } from 'express';
import { utils } from "ethers";
import BigNumber from 'bignumber.js';

import {
  subgraphRequestWithRetry
} from '../utils';

import {
  DEPLOYMENT_CONFIGS,
} from '../constants';

import Controller from './Controller';

BigNumber.config({ EXPONENTIAL_AT: [-1e+9, 1e+9] });

const SUBGRAPH_RECORD_LIMIT_PER_QUERY = 100;

const queryUntilAllRecordsFound = async (
  subgraphEndpoint: any,
  subgraphEndpointFallback: string,
  buildQuery: (userAddress: string, first: number, skip: number) => string,
  userAddress: string,
  logHelper: string,
  skip: number = 0,
  accumulatedRecords: any[] = [],
): Promise<any[]> => {
  console.log("Running queryUntilAllRecordsFound", `skip: ${skip}`, `userAddress: ${userAddress}`, `logHelper: ${logHelper}`);

  let query = buildQuery(userAddress, SUBGRAPH_RECORD_LIMIT_PER_QUERY, skip);
  let result = await subgraphRequestWithRetry(query, (arg0: string) => query, subgraphEndpoint, subgraphEndpointFallback);

  // Check if the result array is not empty and has reached the limit
  if (result?.data?.siloPositions?.length > 0) {
    // Combine the newly fetched records with the accumulated ones
    accumulatedRecords = [...accumulatedRecords, ...result.data.siloPositions];

    // If the length of the result is equal to the limit, there might be more data to fetch
    if (result.data.siloPositions.length === SUBGRAPH_RECORD_LIMIT_PER_QUERY) {
      // Recursively call the function with updated skip value
      return await queryUntilAllRecordsFound(
        subgraphEndpoint,
        subgraphEndpointFallback,
        buildQuery,
        userAddress,
        logHelper,
        skip + SUBGRAPH_RECORD_LIMIT_PER_QUERY,
        accumulatedRecords
      );
    }
  }

  // Return the accumulated records when there are no more records to fetch
  return accumulatedRecords;
};

const buildUserTvlQuery = (
  userAddress: string,
  first: number = 0,
  skip: number = 0,
) => {
  // replace market.id with silo.id when upgrading to latest pending subgraph
  return `{
  siloPositions(
    where:{
      account_contains_nocase:"${userAddress}",
      isActive:true,
    }
    first: ${first},
    skip: ${skip},
  ){
    silo{
      id
      name
    }
    totalCollateralValue
  }
}`
}

class TurtleController extends Controller {
  async getUserTvl(req: Request, res: Response) {
    const { userAddress } = req.params;

    const { groupBy } = req.query;

    try {
      const fetchPromises = DEPLOYMENT_CONFIGS.map(async (deploymentConfig) => {
        const { network } = deploymentConfig;
        try {
          const deploymentPositions = await queryUntilAllRecordsFound(
            deploymentConfig.subgraphEndpointTurtle,
            deploymentConfig.subgraphEndpointTurtle,
            buildUserTvlQuery,
            userAddress,
            `user positions on ${deploymentConfig.idHumanReadable}`
          );

          if(groupBy === 'network' || groupBy === 'all') {

            const networkResult = { total_collateral_value: "0" };

            for (let deploymentPosition of deploymentPositions) {
              networkResult.total_collateral_value = new BigNumber(
                networkResult.total_collateral_value
              ).plus(deploymentPosition.totalCollateralValue).toString();
            }

            return { network, result: networkResult };

          } else {

            const networkResult: { [key: string]: any } = {};

            for (let deploymentPosition of deploymentPositions) {
              let checksumAddress = utils.getAddress(deploymentPosition.silo.id);
              if (!networkResult[checksumAddress]) {
                networkResult[checksumAddress] = {
                  silo_name: deploymentPosition.silo.name,
                  total_collateral_value: deploymentPosition.totalCollateralValue,
                };
              } else {
                networkResult[checksumAddress].total_collateral_value = new BigNumber(
                  networkResult[checksumAddress].total_collateral_value
                )
                  .plus(deploymentPosition.totalCollateralValue)
                  .toString();
              }
            }

            return { network, result: networkResult };

          }
        } catch (e) {
          console.error(`Error fetching data for ${network}:`, e);
          return { network, result: {} };
        }
      });

      const results = await Promise.all(fetchPromises);

      let finalResult = results.reduce((acc, { network, result }) => {
        if(!acc[network]) {
          acc[network] = result;
        } else {
          acc[network] = {...acc[network], ...result};
        }
        return acc;
      }, {} as { [key: string]: any });

      if(groupBy === 'all') {
        let groupedByAllResults = {
          total_collateral_value: "0"
        }
        
        for(let networkKey of Object.keys(finalResult)) {
          groupedByAllResults.total_collateral_value = new BigNumber(
            groupedByAllResults.total_collateral_value
          ).plus(finalResult[networkKey].total_collateral_value).toString();
        }
        finalResult = groupedByAllResults;
      }

      this.sendResponse(res, finalResult);
    } catch (error) {
      console.error("Error in getUserTvl:", error);
      this.sendError(res, "An error occurred while processing the request", 500);
    }
  }
}

export default TurtleController