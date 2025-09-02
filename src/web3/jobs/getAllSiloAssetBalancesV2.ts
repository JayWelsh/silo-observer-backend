import { Contract as MulticallContract } from '@jaywelsh/ethers-multicall';

import { Contract, utils } from 'ethers';

import BigNumber from 'bignumber.js';

import {
  NetworkToProvider,
} from "../../app";

import {
  SILO_BLACKLIST,
  ZERO_ADDRESS,
} from "../../constants";

import SiloFactoryV2ABI from '../abis/SiloFactoryV2ABI.json';
import SiloV2ABI from '../abis/SiloV2ABI.json';
import SiloConfigV2ABI from '../abis/SiloConfigV2ABI.json';
import ERC20ABI from '../abis/ERC20ABI.json';

import {
  queryFilterRetryOnFailure,
  multicallProviderRetryOnFailure,
} from '../utils';

import {
  IDeployment,
} from '../../interfaces';

import {
  NewSiloEventRepository,
} from '../../database/repositories';

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

interface ISiloFeeData {
  daoFee: BigNumber
  deployerFee: BigNumber
  flashloanFee: BigNumber
  asset: string
  daoAndDeployerRevenue: BigNumber
  interestRateTimestamp: BigNumber
  protectedAssets: BigNumber
  collateralAssets: BigNumber
  debtAssets: BigNumber
  calculatedPendingDaoFeesRaw: string
  calculatedPendingDeployerFeesRaw: string
  calculatedPendingDaoFees: string
  calculatedPendingDeployerFees: string
}

interface IAssetData {
  symbol: string
  decimals: number
  address: string
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
    siloFactories.push({contract: repositoryContract, meta: siloFactoryConfig.meta, address: siloFactoryConfig.address, abi: siloFactoryConfig.abi});
  }

  let assetAddresses : string[] = [];
  let assetDecimals : number[] = [];
  let allSiloAssets : any[] = [];
  let siloAssetBorrowedBalances : IAllSiloAssetBalanceResults = {}
  let assetSymbols : string[] = [];
  let siloAssetBalances : IAllSiloAssetBalanceResults = {}
  let siloAddresses : string[] = [];
  let siloAddressToSiloConfigAddress : {[key: string]: string} = {};
  let siloAddressToFeeData : {[key: string]: ISiloFeeData} = {};
  let assetAddressToAssetInfo : {[key: string]: IAssetData} = {};

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
    assetAddressToAssetInfo,
    siloAddressToFeeData,
  }

  for(let siloFactoryContractEntry of siloFactories) {
    let {
      contract: siloFactoryContract,
      meta,
    } = siloFactoryContractEntry;
    if(siloFactoryContract) {

      const siloCreationEvents = await NewSiloEventRepository.getNewSiloEventsByFactoryAddress(siloFactoryContractEntry.address)

      const siloAddresses : string[] = [];
      if(siloCreationEvents?.length > 0) {
        for(let siloCreationEvent of siloCreationEvents) {
          let {
            silo0,
            silo1,
            silo_config
          } = siloCreationEvent;
          if(silo0) {
            siloAddresses.push(silo0);
            siloAddressToSiloConfigAddress[silo0] = silo_config;
          }
          if(silo1) {
            siloAddresses.push(silo1);
            siloAddressToSiloConfigAddress[silo1] = silo_config;
          }
        }
      }

      console.log({siloAddresses})

      const indexedSiloAddresses : string[] = [];

      const siloContracts = siloAddresses.map(address => {
        indexedSiloAddresses.push(address);
        let contract = new MulticallContract(address, SiloV2ABI);
        return contract;
      });

      const siloConfigContracts = siloAddresses.map(address => {
        let contract = new MulticallContract(siloAddressToSiloConfigAddress[address], SiloConfigV2ABI);
        return contract;
      });

      const siloFactoryContracts = siloAddresses.map(address => {
        let contract = new MulticallContract(siloFactoryContractEntry.address, siloFactoryContractEntry.abi);
        return contract;
      });

      [...allSiloAssets] = await multicallProviderRetryOnFailure(siloContracts.map(contract => contract.asset()), 'all silos assets', deploymentConfig.network);
      const [...allSiloStorage] = await multicallProviderRetryOnFailure(siloContracts.map(contract => contract.getSiloStorage()), 'all silo storage', deploymentConfig.network);
      const [...allSiloFeesWithAsset] = await multicallProviderRetryOnFailure(siloConfigContracts.map((contract, index) => contract.getFeesWithAsset(indexedSiloAddresses[index])), 'all silo config fees', deploymentConfig.network);
      const [...allFeeReceivers] = await multicallProviderRetryOnFailure(siloFactoryContracts.map((contract, index) => contract.getFeeReceivers(indexedSiloAddresses[index])), 'all silo fee receivers', deploymentConfig.network);

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
        assetAddressToAssetInfo[flattenedTokenAddresses[resultsIndex]] = {
          decimals: allSiloAssetDecimals[resultsIndex],
          symbol: allSiloAssetSymbols[resultsIndex],
          address: flattenedTokenAddresses[resultsIndex],
        }
        if(!results[siloAddresses[resultsIndex]]) {
          results[siloAddresses[resultsIndex]] = [];
          results[siloAddresses[resultsIndex]].push(singleResult);
        } else {
          results[siloAddresses[resultsIndex]].push(singleResult);
        }
        let borrowedBalance = new BigNumber(utils.formatUnits(allSiloStorage[resultsIndex].debtAssets, allSiloAssetDecimals[resultsIndex])).toString();
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

      for(let [index, siloFeeConfig] of allSiloFeesWithAsset.entries()) {
        let {
          daoFee,
          deployerFee,
          flashloanFee,
          asset
        } = siloFeeConfig;
        let {
          daoAndDeployerRevenue,
          interestRateTimestamp,
          protectedAssets,
          collateralAssets,
          debtAssets,
        } = allSiloStorage[index];
        let {
          dao: daoFeeReceiver,
          deployer: deployerFeeReceiver
        } = allFeeReceivers[index];

        let calculatedPendingDaoFeesRaw = new BigNumber(0);
        let calculatedPendingDeployerFeesRaw = new BigNumber(0);

        if(deployerFeeReceiver === ZERO_ADDRESS) {
          calculatedPendingDaoFeesRaw = daoAndDeployerRevenue;
        } else {
          // daoRevenue = earnedFees * daoFee;
          // unchecked {
          //     // fees are % in decimal point so safe to uncheck
          //     daoRevenue = daoRevenue / (daoFee + deployerFee);
          //     // `daoRevenue` is chunk of `earnedFees`, so safe to uncheck
          //     deployerRevenue = earnedFees - daoRevenue;
          // }
          calculatedPendingDaoFeesRaw = new BigNumber(daoAndDeployerRevenue.toString()).multipliedBy(daoFee.toString());
          calculatedPendingDaoFeesRaw = calculatedPendingDaoFeesRaw.dividedBy(new BigNumber(daoFee.toString()).plus(deployerFee.toString())).integerValue();
          calculatedPendingDeployerFeesRaw = new BigNumber(daoAndDeployerRevenue.toString()).minus(calculatedPendingDaoFeesRaw).integerValue();
        }

        siloAddressToFeeData[indexedSiloAddresses[index]] = {
          daoFee,
          deployerFee,
          flashloanFee,
          asset,
          daoAndDeployerRevenue,
          interestRateTimestamp,
          protectedAssets,
          collateralAssets,
          debtAssets,
          calculatedPendingDaoFeesRaw: calculatedPendingDaoFeesRaw.toString(),
          calculatedPendingDeployerFeesRaw: calculatedPendingDeployerFeesRaw.toString(),
          calculatedPendingDaoFees: new BigNumber(utils.formatUnits(calculatedPendingDaoFeesRaw.toString(), assetAddressToAssetInfo[asset].decimals)).toString(),
          calculatedPendingDeployerFees: new BigNumber(utils.formatUnits(calculatedPendingDeployerFeesRaw.toString(), assetAddressToAssetInfo[asset].decimals)).toString(),
        }
      }

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