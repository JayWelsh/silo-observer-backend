import {
  subgraphRequestWithRetry
} from '../../utils';

import {
  NETWORK_TO_MAX_BLOCK_BATCH_SIZE,
} from '../../constants';

const SUBGRAPH_RECORD_LIMIT_PER_QUERY = 100;

const queryUntilAllRecordsFound = async (
  subgraphEndpoint: any,
  buildQuery: (blockNumberStart: number, blockNumberEnd: number, first: number, skip: number) => string,
  fromBlock: number,
  toBlock: number,
  logHelper: string,
  skip: number = 0,
  accumulatedRecords: any[] = [],
): Promise<any[]> => {
  console.log("Running queryUntilAllRecordsFound", `skip: ${skip}`, `fromBlock: ${fromBlock}`, `toBlock: ${toBlock}`, `logHelper: ${logHelper}`);

  let query = buildQuery(fromBlock, toBlock, SUBGRAPH_RECORD_LIMIT_PER_QUERY, skip);
  let result = await subgraphRequestWithRetry(query, subgraphEndpoint);

  // Check if the result array is not empty and has reached the limit
  if (result?.data?.liquidates?.length > 0) {
    // Combine the newly fetched records with the accumulated ones
    accumulatedRecords = [...accumulatedRecords, ...result.data.liquidates];

    // If the length of the result is equal to the limit, there might be more data to fetch
    if (result.data.liquidates.length === SUBGRAPH_RECORD_LIMIT_PER_QUERY) {
      // Recursively call the function with updated skip value
      return await queryUntilAllRecordsFound(
        subgraphEndpoint,
        buildQuery,
        fromBlock,
        toBlock,
        logHelper,
        skip + SUBGRAPH_RECORD_LIMIT_PER_QUERY,
        accumulatedRecords
      );
    }
  }

  console.log({accumulatedRecordsLength: accumulatedRecords.length});

  // Return the accumulated records when there are no more records to fetch
  return accumulatedRecords;
};

export const subgraphIndexer = async (
  subgraphEndpoint: any,
  buildQuery: (blockNumberStart: number, blockNumberEnd: number, first: number, skip: number) => string,
  latestBlockNumber: number,
  fromBlock: number,
  toBlock: number,
  blockRange: number,
  network: string,
  meta: string,
) => {

  console.log("Calls subgraphIndexer");

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
      console.log(`subgraphIndexer fetching batch ${currentBatch} of ${batchCount} for ${meta} (fromBlock: ${fromBlock}, toBlock: ${toBlock}, useFromBlock: ${useFromBlock}, useToBlock: ${useToBlock})`);

      // fetch batch
      const eventContractEventBatch = await queryUntilAllRecordsFound(subgraphEndpoint, buildQuery, useFromBlock, useToBlock, `${currentBatch} of ${batchCount} - ${meta}`);
      events = [...events, ...(eventContractEventBatch ? eventContractEventBatch : [])];

      // log batch status
      console.log(`subgraphIndexer fetched batch ${currentBatch} of ${batchCount} (${new Date().getTime() - startTime}ms)`);
    }

    return events ? events : [];

  }
  
}