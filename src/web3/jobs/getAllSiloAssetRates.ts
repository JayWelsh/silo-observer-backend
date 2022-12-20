import { Contract as MulticallContract } from 'ethers-multicall';

import { Contract, utils } from 'ethers';

import BigNumber from 'bignumber.js';

import {
  EthersProvider,
  MulticallProvider
} from "../../app";

import {
  SILO_FACTORY_ADDRESS,
  SILO_LENS_ADDRESS,
} from "../../constants";

import SiloFactoryABI from '../abis/SiloFactoryABI.json';
import SiloABI from '../abis/SiloABI.json';
import ERC20ABI from '../abis/ERC20ABI.json';
import SiloLensABI from '../abis/SiloLensABI.json';

BigNumber.config({ EXPONENTIAL_AT: [-1e+9, 1e+9] });

interface IAllSiloAssetRateResults {
  [key: string]: IAllSiloAssetRates[]
}

interface IAllSiloAssetRates {
  rate: string
  side: string
  tokenAddress: string
}

export const getAllSiloAssetRates = async () => {
  
  const SiloFactoryContract = new Contract(SILO_FACTORY_ADDRESS, SiloFactoryABI);
  const siloFactoryContract = await SiloFactoryContract.connect(EthersProvider);

  const siloCreationEventFilter = await siloFactoryContract.filters.NewSiloCreated(null, null);

  const siloCreationEvents = await siloFactoryContract.queryFilter(siloCreationEventFilter);

  const siloAddresses = siloCreationEvents.map((entry) => entry?.args?.silo);

  const indexedSiloAddresses : string[] = [];

  const siloContracts = siloAddresses.map(address => {
    indexedSiloAddresses.push(address);
    let contract = new MulticallContract(address, SiloABI);
    return contract;
  });

  const [...allSiloAssetsWithState] = await MulticallProvider.all(siloContracts.map(contract => contract.getAssets()));

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
    let contract = new MulticallContract(SILO_LENS_ADDRESS, SiloLensABI);
    tokenQueryIndex++
    return contract;
  })

  const [...allSiloBorrowerRates] = await MulticallProvider.all(tokenContracts.map((contract, index) => contract.borrowAPY(queryIndexToSiloAddress[index], flattenedTokenAddresses[index])));
  const [...allSiloLenderRates] = await MulticallProvider.all(tokenContracts.map((contract, index) => contract.depositAPY(queryIndexToSiloAddress[index], flattenedTokenAddresses[index])));

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