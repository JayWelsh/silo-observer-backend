import { Contract as MulticallContract } from '@jaywelsh/ethers-multicall';

import { Contract, utils } from 'ethers';

import BigNumber from 'bignumber.js';

import {
  NetworkToProvider,
} from "../../app";

import {
  SILO_BLACKLIST,
} from "../../constants";

import SiloFactoryV2ABI from '../abis/SiloFactoryV2ABI.json';
import SiloV2ABI from '../abis/SiloV2ABI.json';
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
  protocolFees?: string
  harvestedProtocolFees?: string
  pendingProtocolFees?: string
  harvestedProtocolFeesRaw?: string
  pendingProtocolFeesRaw?: string
  protocolFeesUSD?: string
  harvestedProtocolFeesUSD?: string
  pendingProtocolFeesUSD?: string
}

export const getAllSiloAssetBalancesV2 = async (deploymentConfig: IDeployment) => {

  let provider = NetworkToProvider[deploymentConfig.network];
  if(!provider) {
    throw new Error(`Provider for network not found: ${deploymentConfig.network}, ${deploymentConfig}`);
  }

  let siloFactories = [];
  for(let siloFactoryConfig of deploymentConfig.siloFactories) {
    let FactoryContract = new Contract(siloFactoryConfig.address, siloFactoryConfig.abi);
    let repositoryContract = await FactoryContract.connect(provider);
    siloFactories.push({contract: repositoryContract, meta: siloFactoryConfig.meta});
  }

  let assetAddresses : string[] = [];
  let assetDecimals : number[] = [];
  let allSiloAssets : any[] = [];
  let siloAssetBorrowedBalances : IAllSiloAssetBalanceResults = {}
  let assetSymbols : string[] = [];
  let siloAssetBalances : IAllSiloAssetBalanceResults = {}
  let siloAddresses : string[] = [];
  let siloAddressToSiloConfigAddress : {[key: string]: string} = {};

  let finalResult = {
    success: true,
    siloAssetBalances: siloAssetBalances,
    allSiloAssets: allSiloAssets,
    siloAddresses: siloAddresses,
    assetAddresses: assetAddresses,
    assetSymbols,
    assetDecimals,
    siloAssetBorrowedBalances,
    siloAddressToSiloConfigAddress,
  }

  for(let siloFactoryContractEntry of siloFactories) {
    let {
      contract: siloFactoryContract,
      meta,
    } = siloFactoryContractEntry;
    if(siloFactoryContract) {

      const siloCreationEventFilter = await siloFactoryContract.filters.NewSilo(null, null, null);

      const siloCreationEvents = await queryFilterRetryOnFailure(siloFactoryContract, siloCreationEventFilter);

      const siloAddresses : string[] = [];
      if(siloCreationEvents) {
        for(let siloCreationEvent of siloCreationEvents) {
          if(siloCreationEvent?.args) {
            let {
              silo0,
              silo1,
              siloConfig,
            } = siloCreationEvent.args;

            siloAddresses.push(silo0);
            siloAddresses.push(silo1);
            siloAddressToSiloConfigAddress[silo0] = siloConfig;
            siloAddressToSiloConfigAddress[silo1] = siloConfig;
          }
        }
      }

      console.log({siloAddresses})

      const assetAddresses : string[] = [];

      const indexedSiloAddresses : string[] = [];

      const siloContracts = siloAddresses.map(address => {
        indexedSiloAddresses.push(address);
        let contract = new MulticallContract(address, SiloV2ABI);
        return contract;
      });

      [...allSiloAssets] = await multicallProviderRetryOnFailure(siloContracts.map(contract => contract.asset()), 'all silos assets', deploymentConfig.network);
      const [...allSiloAssetBorrowedAmounts] = await multicallProviderRetryOnFailure(siloContracts.map(contract => contract.getTotalAssetsStorage(2)), 'all silo asset borrowed', deploymentConfig.network);

      console.log({allSiloAssets})

      let flattenedTokenAddresses = allSiloAssets.flat();
      let tokenQueryIndex = 0;
      const tokenContracts = flattenedTokenAddresses.map(tokenAddress => {
        let contract = new MulticallContract(tokenAddress, ERC20ABI);
        tokenQueryIndex++
        return contract;
      })

      const [...allSiloAssetBalances] = await multicallProviderRetryOnFailure(tokenContracts.map((contract, index) => contract.balanceOf(siloAddresses[index])), 'all silo asset balances', deploymentConfig.network);
      const [...allSiloAssetDecimals] = await multicallProviderRetryOnFailure(tokenContracts.map((contract, index) => contract.decimals()), 'all silo asset decimals', deploymentConfig.network);
      const [...allSiloAssetSymbols] = await multicallProviderRetryOnFailure(tokenContracts.map((contract, index) => contract.symbol()), 'all silo asset symbols', deploymentConfig.network);

      let results : IAllSiloAssetBalanceResults = finalResult.siloAssetBalances ? finalResult.siloAssetBalances : {};
      let borrowedAmountResults : IAllSiloAssetBalanceResults = finalResult.siloAssetBorrowedBalances ? finalResult.siloAssetBorrowedBalances : {};
      let resultsIndex = 0;
      for(let entry of allSiloAssetBalances) {
        let balance = new BigNumber(utils.formatUnits(entry, allSiloAssetDecimals[resultsIndex])).toString();
        let singleResult = {
          balance,
          decimals: allSiloAssetDecimals[resultsIndex],
          tokenAddress: flattenedTokenAddresses[resultsIndex]
        };
        if(!results[siloAddresses[resultsIndex]]) {
          results[siloAddresses[resultsIndex]] = [];
          results[siloAddresses[resultsIndex]].push(singleResult);
        } else {
          results[siloAddresses[resultsIndex]].push(singleResult);
        }
        let borrowedBalance = new BigNumber(utils.formatUnits(allSiloAssetBorrowedAmounts[resultsIndex], allSiloAssetDecimals[resultsIndex])).toString();
        let singleBorrowedResult = {
          balance: borrowedBalance,
          decimals: allSiloAssetDecimals[resultsIndex],
          tokenAddress: flattenedTokenAddresses[resultsIndex]
        };
        if(!borrowedAmountResults[siloAddresses[resultsIndex]]) {
          borrowedAmountResults[siloAddresses[resultsIndex]] = [];
          borrowedAmountResults[siloAddresses[resultsIndex]].push(singleBorrowedResult);
        } else {
          borrowedAmountResults[siloAddresses[resultsIndex]].push(singleBorrowedResult);
        }
        resultsIndex++;
      }

      console.log({results})

      // const siloContractsForInterestData = [];
      // const indexedInterestDataAssets : IAllSiloAssetBalances[] = [];
      // const indexedInterestDataSiloAddresses = [];
      // for(let [siloAddress, siloAssets] of Object.entries(results)) {
      //   for(let siloAssetData of siloAssets) {
      //     indexedInterestDataAssets.push(siloAssetData);
      //     indexedInterestDataSiloAddresses.push(siloAddress);
      //     let contract = new MulticallContract(siloAddress, SiloV2ABI);
      //     siloContractsForInterestData.push(contract)
      //   }
      // }

      // const [...allSiloAssetInterestData] = await multicallProviderRetryOnFailure(siloContractsForInterestData.map((contract, index) => contract.interestData(indexedInterestDataAssets[index].tokenAddress)), 'all silo asset interest data (protocol fees)', deploymentConfig.network);

      // let interestDataIndex = 0;
      // for(let interestData of allSiloAssetInterestData) {
      //   let assetData = indexedInterestDataAssets[interestDataIndex];
      //   let siloAddress = indexedInterestDataSiloAddresses[interestDataIndex];
      //   let resultsDataSiloAssets = results[siloAddress];
      //   let matchedIndex = resultsDataSiloAssets.findIndex(item => 
      //       item.balance === assetData.balance &&
      //       item.decimals === assetData.decimals &&
      //       item.tokenAddress === assetData.tokenAddress
      //   );
      //   if(matchedIndex > -1 && results[siloAddress][matchedIndex]) {
      //     let protocolFees = new BigNumber(utils.formatUnits(interestData.protocolFees, assetData.decimals)).toString();
      //     let harvestedProtocolFees = new BigNumber(utils.formatUnits(interestData.harvestedProtocolFees, assetData.decimals)).toString();
      //     let pendingProtocolFees = new BigNumber(utils.formatUnits(interestData.protocolFees, assetData.decimals)).minus(new BigNumber(utils.formatUnits(interestData.harvestedProtocolFees, assetData.decimals))).toString();
      //     let harvestedProtocolFeesRaw = new BigNumber(interestData.harvestedProtocolFees.toString()).toString();
      //     let pendingProtocolFeesRaw = new BigNumber(interestData.protocolFees.toString()).minus(new BigNumber(interestData.harvestedProtocolFees.toString())).toString();
      //     results[siloAddress][matchedIndex].protocolFees = protocolFees;
      //     results[siloAddress][matchedIndex].harvestedProtocolFees = harvestedProtocolFees;
      //     results[siloAddress][matchedIndex].pendingProtocolFees = pendingProtocolFees;
      //     results[siloAddress][matchedIndex].harvestedProtocolFeesRaw = harvestedProtocolFeesRaw;
      //     results[siloAddress][matchedIndex].pendingProtocolFeesRaw = pendingProtocolFeesRaw;
      //   }
      //   interestDataIndex++;
      // }

      if(
        allSiloAssets.length === 0
        || siloAddresses.length === 0 
        // || assetAddresses.length === 0
      ) {
        finalResult.success = false;
      }

      finalResult.siloAssetBalances = results;
      // finalResult.allSiloAssetsWithState = [...finalResult.allSiloAssetsWithState, ...allSiloAssetsWithState];
      finalResult.siloAddresses = [...finalResult.siloAddresses, ...siloAddresses];
      finalResult.assetAddresses = [...finalResult.assetAddresses, ...allSiloAssets];
      finalResult.assetSymbols = [...finalResult.assetSymbols, ...allSiloAssetSymbols];
      finalResult.assetDecimals = [...finalResult.assetDecimals, ...allSiloAssetDecimals];
      finalResult.siloAssetBorrowedBalances = borrowedAmountResults;

    }
  }

  return finalResult;

}