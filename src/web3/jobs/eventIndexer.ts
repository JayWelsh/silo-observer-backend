import {
  queryFilterRetryOnFailure
} from '../utils';

import {
  NETWORK_TO_MAX_BLOCK_BATCH_SIZE,
} from '../../constants';

export const eventIndexer = async (
  contract: any,
  eventFilter: any,
  latestBlockNumber: number,
  fromBlock: number,
  toBlock: number,
  blockRange: number,
  network: string,
  meta: string,
) => {

  let maxBlockBatchSize = NETWORK_TO_MAX_BLOCK_BATCH_SIZE[network];

  if(blockRange > 0) {

    let batchSizeModResult = blockRange % maxBlockBatchSize;
    let isSmallerThanMaxBlockBatchSize = blockRange <= maxBlockBatchSize;

    let batchCount = Math.ceil(blockRange / maxBlockBatchSize);
    if(isSmallerThanMaxBlockBatchSize) {
      batchCount = 1;
    } else if (batchSizeModResult === 0) {
      batchCount = Math.floor(blockRange / maxBlockBatchSize);
    }

    let currentBatch = 0;
    let events : any[] = [];

    let useFromBlock = fromBlock;
    let useToBlock = toBlock;

    for(let iteration of Array.from({length: batchCount})) {

      let startTime = new Date().getTime();

      currentBatch++;

      // get fromBlock and toBlock
      if(currentBatch === batchCount) {
        // last batch
        if(batchCount === 1) {
          // last batch is also first batch
          if((latestBlockNumber - useFromBlock) < maxBlockBatchSize) {
            useToBlock = latestBlockNumber;
          }
        } else {
          // last batch is not first batch
          useFromBlock = useFromBlock + maxBlockBatchSize;
          if((useFromBlock + maxBlockBatchSize) > latestBlockNumber) {
            useToBlock = latestBlockNumber;
          } else {
            useToBlock = useFromBlock + maxBlockBatchSize;
          }
        }
      } else if (currentBatch === 1) {
        // first batch, but not the last batch (e.g. in case one one batch)
        useToBlock = useFromBlock + maxBlockBatchSize;
      } else {
        // middle batch, not the first and not the last
        useFromBlock = useFromBlock + maxBlockBatchSize;
        useToBlock = useFromBlock + maxBlockBatchSize;
      }

      // log batch status
      console.log(`eventIndexer fetching batch ${currentBatch} of ${batchCount} for ${meta} (fromBlock: ${fromBlock}, toBlock: ${toBlock}, useFromBlock: ${useFromBlock}, useToBlock: ${useToBlock})`);

      // fetch batch
      const eventContractEventBatch = await queryFilterRetryOnFailure(contract, eventFilter, useFromBlock, useToBlock, `${currentBatch} of ${batchCount} - ${meta}`);
      events = [...events, ...(eventContractEventBatch ? eventContractEventBatch : [])];

      // log batch status
      console.log(`eventIndexer fetched batch ${currentBatch} of ${batchCount} (${new Date().getTime() - startTime}ms)`);
    }

    return events ? events : [];

  }
  
}