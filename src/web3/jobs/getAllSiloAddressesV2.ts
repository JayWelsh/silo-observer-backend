import { Contract } from 'ethers';

import {
  EthersProvider,
  EthersProviderArbitrum,
  EthersProviderOptimism,
  EthersProviderBase,
  EthersProviderSonic,
} from "../../app";

import {
  queryFilterRetryOnFailure
} from '../utils';

import {
  IDeployment,
} from '../../interfaces';

export const getAllSiloAddressesV2 = async (deploymentConfig: IDeployment) => {

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
    } else if (deploymentConfig.network === 'base') {
      let FactoryContract = new Contract(siloFactoryConfig.address, siloFactoryConfig.abi);
      let factoryContract = await FactoryContract.connect(EthersProviderBase);
      siloFactories.push({contract: factoryContract, meta: siloFactoryConfig.meta});
    } else if (deploymentConfig.network === 'sonic') {
      let FactoryContract = new Contract(siloFactoryConfig.address, siloFactoryConfig.abi);
      let factoryContract = await FactoryContract.connect(EthersProviderSonic);
      siloFactories.push({contract: factoryContract, meta: siloFactoryConfig.meta});
    }
  }

  let siloAddresses : string[] = [];

  for(let siloFactory of siloFactories) {

    let siloFactoryContract = siloFactory.contract;

    const siloCreationEventFilter = await siloFactoryContract.filters.NewSilo(null, null, null);

    const siloCreationEvents = await queryFilterRetryOnFailure(siloFactoryContract, siloCreationEventFilter);

    if(siloCreationEvents) {
      
      if(siloCreationEvents) {
        for(let siloCreationEvent of siloCreationEvents) {
          if(siloCreationEvent?.args) {
            let {
              silo0,
              silo1,
            } = siloCreationEvent.args;

            siloAddresses.push(silo0);
            siloAddresses.push(silo1);
          }
        }
      }

    }

  }

  return siloAddresses;

}