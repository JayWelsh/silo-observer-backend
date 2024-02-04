import { Event } from 'ethers';

import {
  sleep,
} from '../../utils';

import {
  EthersProvider,
  EthersProviderArbitrum,
  MulticallProvider,
  MulticallProviderArbitrum,
} from "../../app";

import {
  MAX_TOTAL_BLOCK_RANGE,
  MAX_TOTAL_BLOCK_RANGE_SUBGRAPH,
} from "../../constants";

export interface IEventIndexerBlockTracker {
  event_name: string
  last_checked_block: number
  genesis_block: number
  meta: string
  network: string
}

export const extractFromBlockToBlock = (
  latestBlockNumber: number,
  eventIndexBlockTracker: IEventIndexerBlockTracker,
  subgraphMode: boolean = false,
) => {
  
    const {
      last_checked_block,
      genesis_block,
      network,
    } = eventIndexBlockTracker;
  
    let toBlock = latestBlockNumber;
  
    // derive fromBlock
    let fromBlock = 0;
    if(last_checked_block) {
      fromBlock = last_checked_block + 1;
    } else if (genesis_block) { // keep else, condition is (genesis_block && !last_checked_block)
      fromBlock = genesis_block
    }

    let blockRange = (toBlock - fromBlock) + 1;

    if(subgraphMode) {
      if(blockRange > MAX_TOTAL_BLOCK_RANGE_SUBGRAPH[network]) {
        toBlock = fromBlock + MAX_TOTAL_BLOCK_RANGE_SUBGRAPH[network];
        blockRange = (toBlock - fromBlock) + 1;
      }
    } else {
      if(blockRange > MAX_TOTAL_BLOCK_RANGE[network]) {
        toBlock = fromBlock + MAX_TOTAL_BLOCK_RANGE[network];
        blockRange = (toBlock - fromBlock) + 1;
      }
    }

    console.log({blockRange, fromBlock, toBlock });

    return {
      fromBlock,
      toBlock,
      blockRange
    }
    
}

export const queryFilterRetryOnFailure = async (
  contract: any,
  eventFilter: any,
  fromBlock?: number,
  toBlock?: number,
  batchInfo?: string,
  retryCount?: number,
  retryMax?: number,
): Promise<Array<Event> | null> => {
  if(!retryMax) {
    retryMax = 10;
  }
  if(!retryCount) {
    retryCount = 0;
  }
  try {
    const eventContractEventBatch = await contract.queryFilter(eventFilter, fromBlock, toBlock);
    return eventContractEventBatch;
  } catch (e) {
    retryCount++;
    if(retryCount <= retryMax) {
      console.error(`Query failed, starting retry #${retryCount} (eventFilter: ${eventFilter}, fromBlock: ${fromBlock}, toBlock: ${toBlock}, batchInfo: ${batchInfo ? batchInfo : "N/A"})`);
      let randomDelay = 1000 + Math.floor(Math.random() * 3000);
      await sleep(randomDelay);
      return await queryFilterRetryOnFailure(contract, eventFilter, fromBlock, toBlock, batchInfo, retryCount, retryMax);
    } else {
      console.error(`Unable to complete queryFilter after max retries (eventFilter: ${eventFilter}, fromBlock: ${fromBlock}, toBlock: ${toBlock}, batchInfo: ${batchInfo ? batchInfo : "N/A"}, error: ${e})`);
      return null;
    }
  }
}

export const multicallProviderRetryOnFailure = async (
  calls: any[],
  meta: string,
  network: string,
  retryCount?: number,
  retryMax?: number,
): Promise<Array<any>> => {
  if(!retryMax) {
    retryMax = 10;
  }
  if(!retryCount) {
    retryCount = 0;
  }
  try {
    let useProvider = MulticallProvider;
    if(network === "arbitrum") {
      useProvider = MulticallProviderArbitrum;
    }
    const [...results] = await useProvider.all(calls);
    return results;
  } catch (e) {
    retryCount++;
    if(retryCount <= retryMax) {
      console.error(`Multicall failed, starting retry #${retryCount} (meta: ${meta})`);
      let randomDelay = 1000 + Math.floor(Math.random() * 1000);
      await sleep(randomDelay);
      return await multicallProviderRetryOnFailure(calls, meta, network, retryCount, retryMax);
    } else {
      console.error(`Unable to complete multicallProviderRetryOnFailure after max retries (meta: ${meta})`);
      return [];
    }
  }
}

export const getBlockWithRetries = async (blockNumber: number, network: string, retryCount?: number, retryMax?: number): Promise<any> => {
  if(!retryMax) {
    retryMax = 10;
  }
  if(!retryCount) {
    retryCount = 0;
  }
  try {
    let provider = EthersProvider;
    if(network === "arbitrum") {
      provider = EthersProviderArbitrum;
    }

    let block = await provider.getBlock(blockNumber).catch(e => {throw new Error(e)});
    return block;
  } catch (e) {
    retryCount++;
    if(retryCount <= retryMax) {
      console.error(`Query failed, starting retry #${retryCount} (blockNumber: ${blockNumber})`);
      let randomDelay = 1000 + Math.floor(Math.random() * 1000);
      await sleep(randomDelay);
      return await getBlockWithRetries(blockNumber, network, retryCount, retryMax);
    } else {
      console.error(`Unable to complete getBlock after max retries (blockNumber: ${blockNumber})`, e);
      return null;
    }
  }
}

export const getEventFingerprint = (network: string, blockNumber: string | number, txIndex: string | number, logIndex: string | number) => {
  return `${network}-${blockNumber}-${txIndex}-${logIndex}`;
}