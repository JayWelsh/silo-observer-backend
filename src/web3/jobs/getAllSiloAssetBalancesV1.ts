import { Contract as MulticallContract } from '@jaywelsh/ethers-multicall';

import { Contract, utils } from 'ethers';

import BigNumber from 'bignumber.js';

import {
  EthersProvider,
  EthersProviderArbitrum,
  EthersProviderOptimism,
  EthersProviderBase,
  EthersProviderSonic,
  EthersProviderAvalanche,
} from "../../app";

import {
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
  IDeploymentV1,
} from '../../interfaces';

BigNumber.config({ EXPONENTIAL_AT: [-1e+9, 1e+9] });

interface IAllSiloAssetBalanceResults {
  [key: string]: IAllSiloAssetBalances[]
}

interface IAllSiloAssetBalances {
  balance: string
  decimals: number
  tokenAddress: string
  protocolFees?: string
  harvestedProtocolFees?: string
  pendingProtocolFees?: string
  harvestedProtocolFeesRaw?: string
  pendingProtocolFeesRaw?: string
  protocolFeesUSD?: string
  harvestedProtocolFeesUSD?: string
  pendingProtocolFeesUSD?: string
}

export const getAllSiloAssetBalancesV1 = async (deploymentConfig: IDeploymentV1) => {

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
  } else if (deploymentConfig.network === 'optimism') {
    let RepositoryContract = new Contract(deploymentConfig.siloRepository.address, deploymentConfig.siloRepository.abi);
    let repositoryContract = await RepositoryContract.connect(EthersProviderOptimism);
    siloRepositories.push({contract: repositoryContract, meta: deploymentConfig.siloRepository.meta});
  } else if (deploymentConfig.network === 'base') {
    let RepositoryContract = new Contract(deploymentConfig.siloRepository.address, deploymentConfig.siloRepository.abi);
    let repositoryContract = await RepositoryContract.connect(EthersProviderBase);
    siloRepositories.push({contract: repositoryContract, meta: deploymentConfig.siloRepository.meta});
  } else if (deploymentConfig.network === 'sonic') {
    let RepositoryContract = new Contract(deploymentConfig.siloRepository.address, deploymentConfig.siloRepository.abi);
    let repositoryContract = await RepositoryContract.connect(EthersProviderSonic);
    siloRepositories.push({contract: repositoryContract, meta: deploymentConfig.siloRepository.meta});
  } else if (deploymentConfig.network === 'avalanche') {
    let RepositoryContract = new Contract(deploymentConfig.siloRepository.address, deploymentConfig.siloRepository.abi);
    let repositoryContract = await RepositoryContract.connect(EthersProviderAvalanche);
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

      const siloContractsForInterestData = [];
      const indexedInterestDataAssets : IAllSiloAssetBalances[] = [];
      const indexedInterestDataSiloAddresses = [];
      for(let [siloAddress, siloAssets] of Object.entries(results)) {
        for(let siloAssetData of siloAssets) {
          indexedInterestDataAssets.push(siloAssetData);
          indexedInterestDataSiloAddresses.push(siloAddress);
          let contract = new MulticallContract(siloAddress, SiloABI);
          siloContractsForInterestData.push(contract)
        }
      }

      const [...allSiloAssetInterestData] = await multicallProviderRetryOnFailure(siloContractsForInterestData.map((contract, index) => contract.interestData(indexedInterestDataAssets[index].tokenAddress)), 'all silo asset interest data (protocol fees)', deploymentConfig.network);

      let interestDataIndex = 0;
      for(let interestData of allSiloAssetInterestData) {
        let assetData = indexedInterestDataAssets[interestDataIndex];
        let siloAddress = indexedInterestDataSiloAddresses[interestDataIndex];
        let resultsDataSiloAssets = results[siloAddress];
        let matchedIndex = resultsDataSiloAssets.findIndex(item => 
            item.balance === assetData.balance &&
            item.decimals === assetData.decimals &&
            item.tokenAddress === assetData.tokenAddress
        );
        if(matchedIndex > -1 && results[siloAddress][matchedIndex]) {
          let protocolFees = new BigNumber(utils.formatUnits(interestData.protocolFees, assetData.decimals)).toString();
          let harvestedProtocolFees = new BigNumber(utils.formatUnits(interestData.harvestedProtocolFees, assetData.decimals)).toString();
          let pendingProtocolFees = new BigNumber(utils.formatUnits(interestData.protocolFees, assetData.decimals)).minus(new BigNumber(utils.formatUnits(interestData.harvestedProtocolFees, assetData.decimals))).toString();
          let harvestedProtocolFeesRaw = new BigNumber(interestData.harvestedProtocolFees.toString()).toString();
          let pendingProtocolFeesRaw = new BigNumber(interestData.protocolFees.toString()).minus(new BigNumber(interestData.harvestedProtocolFees.toString())).toString();
          results[siloAddress][matchedIndex].protocolFees = protocolFees;
          results[siloAddress][matchedIndex].harvestedProtocolFees = harvestedProtocolFees;
          results[siloAddress][matchedIndex].pendingProtocolFees = pendingProtocolFees;
          results[siloAddress][matchedIndex].harvestedProtocolFeesRaw = harvestedProtocolFeesRaw;
          results[siloAddress][matchedIndex].pendingProtocolFeesRaw = pendingProtocolFeesRaw;
        }
        interestDataIndex++;
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