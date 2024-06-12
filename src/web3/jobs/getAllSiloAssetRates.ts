import { Contract as MulticallContract } from '@kargakis/ethers-multicall';

import { Contract, utils } from 'ethers';

import BigNumber from 'bignumber.js';

import {
  multicallProviderRetryOnFailure,
} from '../utils';

import {
  IDeployment,
} from '../../interfaces';

BigNumber.config({ EXPONENTIAL_AT: [-1e+9, 1e+9] });

interface IAllSiloAssetRateResults {
  [key: string]: IAllSiloAssetRates[]
}

interface IAllSiloAssetRates {
  rate: string
  side: string
  tokenAddress: string
}

export const getAllSiloAssetRates = async (siloAddresses: string [], allSiloAssetsWithState: string[][], deploymentConfig: IDeployment) => {

  const indexedSiloAddresses : string[] = siloAddresses;

  let siloIndex = 0;
  let queryIndexToSiloAddress : string[] = [];
  for(let singleSiloAssetsWithState of allSiloAssetsWithState) {
    let siloAddress = indexedSiloAddresses[siloIndex];
    for(let singleSiloAsset of singleSiloAssetsWithState) {
      queryIndexToSiloAddress.push(siloAddress);
    }
    siloIndex++;
  }

  let flattenedTokenAddresses = allSiloAssetsWithState.flat();
  let tokenQueryIndex = 0;
  const tokenContracts = flattenedTokenAddresses.map(tokenAddress => {
    let contract = new MulticallContract(deploymentConfig.siloLens, deploymentConfig.siloLensABI);
    tokenQueryIndex++
    return contract;
  }).filter((item) => item);

  const [...allSiloBorrowerRates] = await multicallProviderRetryOnFailure(tokenContracts.map((contract, index) => contract.borrowAPY(queryIndexToSiloAddress[index], flattenedTokenAddresses[index])), 'all silo borrower rates', deploymentConfig.network);
  const [...allSiloLenderRates] = await multicallProviderRetryOnFailure(tokenContracts.map((contract, index) => contract.depositAPY(queryIndexToSiloAddress[index], flattenedTokenAddresses[index])), 'all silo lender rates', deploymentConfig.network);

  let rateResults : IAllSiloAssetRateResults = {};
  let borrowerResultsIndex = 0;
  for(let entry of allSiloBorrowerRates) {
    let rate = entry.toString()
    let singleResult = {
      rate: new BigNumber(utils.formatUnits(rate, 16)).toString(),
      side: 'BORROWER',
      tokenAddress: flattenedTokenAddresses[borrowerResultsIndex]
    };
    if(!rateResults[queryIndexToSiloAddress[borrowerResultsIndex]]) {
      rateResults[queryIndexToSiloAddress[borrowerResultsIndex]] = [];
      rateResults[queryIndexToSiloAddress[borrowerResultsIndex]].push(singleResult);
    } else {
      rateResults[queryIndexToSiloAddress[borrowerResultsIndex]].push(singleResult);
    }
    borrowerResultsIndex++;
  }

  let lenderResultsIndex = 0;
  for(let entry of allSiloLenderRates) {
    let rate = entry.toString()
    let singleResult = {
      rate: new BigNumber(utils.formatUnits(rate, 16)).toString(),
      side: 'LENDER',
      tokenAddress: flattenedTokenAddresses[lenderResultsIndex]
    };
    if(!rateResults[queryIndexToSiloAddress[lenderResultsIndex]]) {
      rateResults[queryIndexToSiloAddress[lenderResultsIndex]] = [];
      rateResults[queryIndexToSiloAddress[lenderResultsIndex]].push(singleResult);
    } else {
      rateResults[queryIndexToSiloAddress[lenderResultsIndex]].push(singleResult);
    }
    lenderResultsIndex++;
  }

  return rateResults;

}