import {
  EthersProvider,
  EthersProviderArbitrum,
  EthersProviderOptimism,
} from "../../app";

export const getLatestBlockNumber = async (network: string) => {

  let provider = EthersProvider;
  if(network === 'arbitrum') {
    provider = EthersProviderArbitrum;
  } else if(network === "optimism") {
    provider = EthersProviderOptimism;
  }
  
  let blockNumber = await provider.getBlockNumber();
  return blockNumber;
  
}