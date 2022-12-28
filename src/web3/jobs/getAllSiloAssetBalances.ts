import { Contract as MulticallContract } from 'ethers-multicall';

import { Contract, utils } from 'ethers';

import BigNumber from 'bignumber.js';

import {
  EthersProvider,
} from "../../app";

import {
  SILO_FACTORY_ADDRESS,
} from "../../constants";

import SiloFactoryABI from '../abis/SiloFactoryABI.json';
import SiloABI from '../abis/SiloABI.json';
import ERC20ABI from '../abis/ERC20ABI.json';

import {
  queryFilterRetryOnFailure,
  multicallProviderRetryOnFailure,
} from '../utils';

BigNumber.config({ EXPONENTIAL_AT: [-1e+9, 1e+9] });

interface IAllSiloAssetBalanceResults {
  [key: string]: IAllSiloAssetBalances[]
}

interface IAllSiloAssetBalances {
  balance: string
  decimals: number
  tokenAddress: string
}

export const getAllSiloAssetBalances = async () => {
  
  const SiloFactoryContract = new Contract(SILO_FACTORY_ADDRESS, SiloFactoryABI);
  const siloFactoryContract = await SiloFactoryContract.connect(EthersProvider);

  const siloCreationEventFilter = await siloFactoryContract.filters.NewSiloCreated(null, null);

  const siloCreationEvents = await queryFilterRetryOnFailure(siloFactoryContract, siloCreationEventFilter);

  const siloAddresses = siloCreationEvents ? siloCreationEvents.map((entry) => entry?.args?.silo) : [];

  const assetAddresses : string[] = [];

  const indexedSiloAddresses : string[] = [];

  const siloContracts = siloAddresses.map(address => {
    indexedSiloAddresses.push(address);
    let contract = new MulticallContract(address, SiloABI);
    return contract;
  });

  const [...allSiloAssetsWithState] = await multicallProviderRetryOnFailure(siloContracts.map(contract => contract.getAssets()), 'all silos with state');

  let siloIndex = 0;
  let queryIndexToSiloAddress : string[] = [];
  for(let singleSiloAssetsWithState of allSiloAssetsWithState) {
    let siloAddress = indexedSiloAddresses[siloIndex];
    for(let singleSiloAsset of singleSiloAssetsWithState) {
      queryIndexToSiloAddress.push(siloAddress);
      if(assetAddresses.indexOf(singleSiloAsset) === -1) {
        assetAddresses.push(singleSiloAsset);
      }
    }
    siloIndex++;
  }

  let flattenedTokenAddresses = allSiloAssetsWithState.flat();
  let tokenQueryIndex = 0;
  const tokenContracts = flattenedTokenAddresses.map(tokenAddress => {
    let contract = new MulticallContract(tokenAddress, ERC20ABI);
    tokenQueryIndex++
    return contract;
  })

  const [...allSiloAssetBalances] = await multicallProviderRetryOnFailure(tokenContracts.map((contract, index) => contract.balanceOf(queryIndexToSiloAddress[index])), 'all silo asset balances');
  const [...allSiloAssetDecimals] = await multicallProviderRetryOnFailure(tokenContracts.map((contract, index) => contract.decimals()), 'all silo asset decimals');

  let results : IAllSiloAssetBalanceResults = {};
  let resultsIndex = 0;
  for(let entry of allSiloAssetBalances) {
    let balance = new BigNumber(utils.formatUnits(entry, allSiloAssetDecimals[resultsIndex])).toString();
    let singleResult = {
      balance,
      decimals: allSiloAssetDecimals[resultsIndex],
      tokenAddress: flattenedTokenAddresses[resultsIndex]
    };
    if(!results[queryIndexToSiloAddress[resultsIndex]]) {
      results[queryIndexToSiloAddress[resultsIndex]] = [];
      results[queryIndexToSiloAddress[resultsIndex]].push(singleResult);
    } else {
      results[queryIndexToSiloAddress[resultsIndex]].push(singleResult);
    }
    resultsIndex++;
  }

  return {
    siloAssetBalances: results,
    allSiloAssetsWithState,
    siloAddresses,
    assetAddresses,
  }

}