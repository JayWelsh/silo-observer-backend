import {
  EthersProvider,
  EthersProviderArbitrum,
  EthersProviderOptimism,
  EthersProviderBase,
  EthersProviderSonic,
  EthersProviderAvalanche,
} from "../../app";

export const getLatestBlockNumber = async (network: string) => {

  let provider = EthersProvider;
  if(network === 'arbitrum') {
    provider = EthersProviderArbitrum;
  } else if(network === "optimism") {
    provider = EthersProviderOptimism;
  } else if (network === "base") {
    provider = EthersProviderBase;
  } else if (network === "sonic") {
    provider = EthersProviderSonic;
  } else if (network === "avalanche") {
    provider = EthersProviderAvalanche;
  }
  
  let blockNumber = await provider.getBlockNumber();
  return blockNumber;
  
}