import {
  EthersProvider,
} from "../../app";

export const getLatestBlockNumber = async () => {
  
  let blockNumber = await EthersProvider.getBlockNumber();

  return blockNumber;
  
}