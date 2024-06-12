import { Contract } from 'ethers';

import {
  EthersProvider,
  EthersProviderArbitrum,
  EthersProviderOptimism,
} from "../../app";

import {
  queryFilterRetryOnFailure
} from '../utils';

import {
  IDeployment,
} from '../../interfaces';

import SiloFactoryABI from '../abis/SiloFactoryABI.json';

export const getAllSiloAddresses = async (deploymentConfig: IDeployment) => {

  let siloFactories = [];
  
  for(let siloFactoryConfig of deploymentConfig.siloFactories) {
    if(deploymentConfig.network === 'ethereum') {
      let FactoryContract = new Contract(siloFactoryConfig.address, siloFactoryConfig.abi);
      let factoryContract = await FactoryContract.connect(EthersProvider);
      siloFactories.push({contract: factoryContract, meta: siloFactoryConfig.meta});
    } else if (deploymentConfig.network === 'arbitrum') {
      let FactoryContract = new Contract(siloFactoryConfig.address, siloFactoryConfig.abi);
      let factoryContract = await FactoryContract.connect(EthersProviderArbitrum);
      siloFactories.push({contract: factoryContract, meta: siloFactoryConfig.meta});
    } else if (deploymentConfig.network === 'optimism') {
      let FactoryContract = new Contract(siloFactoryConfig.address, siloFactoryConfig.abi);
      let factoryContract = await FactoryContract.connect(EthersProviderOptimism);
      siloFactories.push({contract: factoryContract, meta: siloFactoryConfig.meta});
    }
  }

  let siloAddresses : string[] = [];

  for(let siloFactory of siloFactories) {

    let siloFactoryContract = siloFactory.contract;

    const siloCreationEventFilter = await siloFactoryContract.filters.NewSiloCreated(null, null);

    const siloCreationEvents = await queryFilterRetryOnFailure(siloFactoryContract, siloCreationEventFilter);

    if(siloCreationEvents) {

      const siloAddresses = siloCreationEvents.map((entry) => entry?.args?.silo);

      return siloAddresses

    }

  }

  return siloAddresses;

}