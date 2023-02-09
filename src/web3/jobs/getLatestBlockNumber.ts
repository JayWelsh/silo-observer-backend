import {
  EthersProvider,
  EthersProviderArbitrum,
} from "../../app";

export const getLatestBlockNumber = async (network: string) => {

  let provider = EthersProvider;
  if(network === 'arbitrum') {
    provider = EthersProviderArbitrum;
  }
  
  let blockNumber = await provider.getBlockNumber();
  return blockNumber;
  
}