import { Contract } from 'ethers';

import {
  EthersProvider,
  EthersProviderArbitrum,
} from "../../app";

import {
  SILO_FACTORY_ADDRESS,
  SILO_FACTORY_ADDRESS_ARBITRUM,
} from "../../constants";

import {
  queryFilterRetryOnFailure
} from '../utils';

import SiloFactoryABI from '../abis/SiloFactoryABI.json';

export const getAllSiloAddresses = async (network: string) => {

  let SiloFactoryContract;
  let siloFactoryContract;
  
  if(network === 'ethereum') {
    SiloFactoryContract = new Contract(SILO_FACTORY_ADDRESS, SiloFactoryABI);
    siloFactoryContract = await SiloFactoryContract.connect(EthersProvider);
  } else if (network === 'arbitrum') {
    SiloFactoryContract = new Contract(SILO_FACTORY_ADDRESS_ARBITRUM, SiloFactoryABI);
    siloFactoryContract = await SiloFactoryContract.connect(EthersProviderArbitrum);
  }

  if(SiloFactoryContract && siloFactoryContract) {

    const siloCreationEventFilter = await siloFactoryContract.filters.NewSiloCreated(null, null);

    const siloCreationEvents = await queryFilterRetryOnFailure(siloFactoryContract, siloCreationEventFilter);

    if(siloCreationEvents) {

      const siloAddresses = siloCreationEvents.map((entry) => entry?.args?.silo);

      return siloAddresses

    }

  }

  return [];

}