import { Contract } from 'ethers';

import {
  EthersProvider,
} from "../../app";

import {
  SILO_FACTORY_ADDRESS,
} from "../../constants";

import {
  queryFilterRetryOnFailure
} from '../utils';

import SiloFactoryABI from '../abis/SiloFactoryABI.json';

export const getAllSiloAddresses = async () => {

  const SiloFactoryContract = new Contract(SILO_FACTORY_ADDRESS, SiloFactoryABI);
  const siloFactoryContract = await SiloFactoryContract.connect(EthersProvider);

  const siloCreationEventFilter = await siloFactoryContract.filters.NewSiloCreated(null, null);

  const siloCreationEvents = await queryFilterRetryOnFailure(siloFactoryContract, siloCreationEventFilter);

  if(siloCreationEvents) {

    const siloAddresses = siloCreationEvents.map((entry) => entry?.args?.silo);

    return siloAddresses

  }

  return [];

}