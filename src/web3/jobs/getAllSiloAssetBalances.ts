import { Contract as MulticallContract } from 'ethers-multicall';

import { Contract, utils } from 'ethers';

import BigNumber from 'bignumber.js';

import {
  EthersProvider,
  EthersProviderArbitrum,
} from "../../app";

import {
  SILO_FACTORY_ADDRESS,
  SILO_CONVEX_FACTORY_ADDRESS,
  SILO_LLAMA_FACTORY_ADDRESS,
  SILO_FACTORY_ADDRESS_ARBITRUM,
  SILO_BLACKLIST,
} from "../../constants";

import SiloFactoryABI from '../abis/SiloFactoryABI.json';
import SiloConvexFactoryABI from '../abis/SiloConvexFactoryABI.json';
import SiloLlamaFactoryABI from '../abis/SiloLlamaFactoryABI.json';
import SiloABI from '../abis/SiloABI.json';
import ERC20ABI from '../abis/ERC20ABI.json';

import {
  queryFilterRetryOnFailure,
  multicallProviderRetryOnFailure,
} from '../utils';

import {
  IDeployment,
} from '../../interfaces';

BigNumber.config({ EXPONENTIAL_AT: [-1e+9, 1e+9] });

interface IAllSiloAssetBalanceResults {
  [key: string]: IAllSiloAssetBalances[]
}

interface IAllSiloAssetBalances {
  balance: string
  decimals: number
  tokenAddress: string
}

export const getAllSiloAssetBalances = async (deploymentConfig: IDeployment) => {

  let siloFactories = [];

  // for(let siloFactoryConfig of deploymentConfig.siloFactories) {
  //   if(deploymentConfig.network === 'ethereum') {
  //     let FactoryContract = new Contract(siloFactoryConfig.address, siloFactoryConfig.abi);
  //     let factoryContract = await FactoryContract.connect(EthersProvider);
  //     siloFactories.push({contract: factoryContract, meta: siloFactoryConfig.meta});
  //   } else if (deploymentConfig.network === 'arbitrum') {
  //     let FactoryContract = new Contract(siloFactoryConfig.address, siloFactoryConfig.abi);
  //     let factoryContract = await FactoryContract.connect(EthersProviderArbitrum);
  //     siloFactories.push({contract: factoryContract, meta: siloFactoryConfig.meta});
  //   }
  // }

  let siloRepositories = [];

  if(deploymentConfig.network === 'ethereum') {
    let RepositoryContract = new Contract(deploymentConfig.siloRepository.address, deploymentConfig.siloRepository.abi);
    let repositoryContract = await RepositoryContract.connect(EthersProvider);
    siloRepositories.push({contract: repositoryContract, meta: deploymentConfig.siloRepository.meta});
  } else if (deploymentConfig.network === 'arbitrum') {
    let RepositoryContract = new Contract(deploymentConfig.siloRepository.address, deploymentConfig.siloRepository.abi);
    let repositoryContract = await RepositoryContract.connect(EthersProviderArbitrum);
    siloRepositories.push({contract: repositoryContract, meta: deploymentConfig.siloRepository.meta});
  }
  
  // if(network === 'ethereum') {
  //   // let SiloFactoryContract = new Contract(SILO_FACTORY_ADDRESS, SiloFactoryABI);
  //   // let siloFactoryContract = await SiloFactoryContract.connect(EthersProvider);
  //   // siloFactories.push({contract: siloFactoryContract, meta: 'original'});
  //   // let SiloConvexFactoryContract = new Contract(SILO_CONVEX_FACTORY_ADDRESS, SiloConvexFactoryABI);
  //   // let siloConvexFactoryContract = await SiloConvexFactoryContract.connect(EthersProvider);
  //   // siloFactories.push({contract: siloConvexFactoryContract, meta: 'convex'});
  //   let SiloLlamaFactoryContract = new Contract(SILO_LLAMA_FACTORY_ADDRESS, SiloLlamaFactoryABI);
  //   let siloLlamaFactoryContract = await SiloLlamaFactoryContract.connect(EthersProvider);
  //   siloFactories.push({contract: siloLlamaFactoryContract, meta: 'llama'});
  // } else if (network === 'arbitrum') {
  //   let SiloFactoryContract = new Contract(SILO_FACTORY_ADDRESS_ARBITRUM, SiloFactoryABI);
  //   let siloFactoryContract = await SiloFactoryContract.connect(EthersProviderArbitrum);
  //   siloFactories.push({contract: siloFactoryContract, meta: 'arbitrum'});
  // }

  let assetAddresses : string[] = [];
  let allSiloAssetsWithState : any[] = [];
  let siloAssetBalances : IAllSiloAssetBalanceResults = {}
  let siloAddresses : string[] = [];

  let finalResult = {
    success: true,
    siloAssetBalances: siloAssetBalances,
    allSiloAssetsWithState: allSiloAssetsWithState,
    siloAddresses: siloAddresses,
    assetAddresses: assetAddresses,
  }

  for(let siloRepositoryContractEntry of siloRepositories) {
    let {
      contract: siloRepositoryContract,
      meta,
    } = siloRepositoryContractEntry;
    if(siloRepositoryContract) {

      const siloCreationEventFilter = await siloRepositoryContract.filters.NewSilo(null, null);

      const siloCreationEvents = await queryFilterRetryOnFailure(siloRepositoryContract, siloCreationEventFilter);

      const siloAddresses = siloCreationEvents ? siloCreationEvents.map((entry) => entry?.args?.silo).filter((item) => SILO_BLACKLIST.indexOf(item) === -1) : [];

      const assetAddresses : string[] = [];

      const indexedSiloAddresses : string[] = [];

      const siloContracts = siloAddresses.map(address => {
        indexedSiloAddresses.push(address);
        let contract = new MulticallContract(address, SiloABI);
        return contract;
      });

      const [...allSiloAssetsWithState] = await multicallProviderRetryOnFailure(siloContracts.map(contract => contract.getAssets()), 'all silos with state', deploymentConfig.network);

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

      const [...allSiloAssetBalances] = await multicallProviderRetryOnFailure(tokenContracts.map((contract, index) => contract.balanceOf(queryIndexToSiloAddress[index])), 'all silo asset balances', deploymentConfig.network);
      const [...allSiloAssetDecimals] = await multicallProviderRetryOnFailure(tokenContracts.map((contract, index) => contract.decimals()), 'all silo asset decimals', deploymentConfig.network);

      let results : IAllSiloAssetBalanceResults = finalResult.siloAssetBalances ? finalResult.siloAssetBalances : {};
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

      if(allSiloAssetsWithState.length === 0 || siloAddresses.length === 0 || assetAddresses.length === 0) {
        finalResult.success = false;
      }

      finalResult.siloAssetBalances = results;
      finalResult.allSiloAssetsWithState = [...finalResult.allSiloAssetsWithState, ...allSiloAssetsWithState];
      finalResult.siloAddresses = [...finalResult.siloAddresses, ...siloAddresses];
      finalResult.assetAddresses = [...finalResult.assetAddresses, ...assetAddresses];

    }
  }

  console.log({finalResult})

  return finalResult;

}