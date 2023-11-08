import path from 'path';
import axios from 'axios';

import BigNumber from 'bignumber.js';

import { 
  SUBGRAPH_ENDPOINT,
  COINGECKO_API_KEY,
  NETWORK_ID_TO_COINGECKO_ID,
} from '../constants';

import {
  formatPercentage,
  formatDecimal,
} from './numberFormatting';

BigNumber.config({ EXPONENTIAL_AT: [-1e+9, 1e+9] });

const envPath = (directory: string) => path.resolve(__dirname, '../../' + directory);
const srcPath = (directory: string) => path.resolve("src", directory || "");

require('dotenv').config({ path: envPath(".env") });

const env = (key: string, defaultValue?: any) => {
  const value = process.env[key] || defaultValue
  if (typeof value === "undefined") {
      throw new Error(`Environment variable ${key} not set.`)
  }

  return value;
}

const sleep = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const subgraphRequestWithRetry = async (query: string, url = SUBGRAPH_ENDPOINT, retryMax = 3, retryCount = 0) => {
  try {
    let result = await axios.post(url, {
      query: query
    }, { 
      headers: { 
        "Accept-Encoding": "gzip,deflate,compress",
        "content-type": "application/json"
      } 
    })
    .then((response) => response.data)
    if(result.errors) {
      console.error(result.errors);
      throw new Error(result.errors);
    }
    return result;
  } catch (e) {
    retryCount++;
    if(retryCount < retryMax) {
      console.log(`Query failed, retry #${retryCount}`);
      await sleep(4000);
      await subgraphRequestWithRetry(query, url, retryMax, retryCount);
    } else {
      //@ts-ignore
      throw new Error(e);
    }
  }
}

let coingeckoRetryMax = 10;

export const fetchCoingeckoPriceAtHistoricalRange = async (assetAddress : string, network: string, startTime: number, endTime: number, retryCount = 0) => {
  let results : number[][] = await axios.get(
    `https://pro-api.coingecko.com/api/v3/coins/${NETWORK_ID_TO_COINGECKO_ID[network]}/contract/${assetAddress}/market_chart/range?vs_currency=usd&from=${startTime}&to=${endTime}&x_cg_pro_api_key=${COINGECKO_API_KEY}`,
    {
      headers: { "Accept-Encoding": "gzip,deflate,compress" }
    }
  )
  .then(function (response) {
    // handle success
    return response?.data?.prices ? response?.data?.prices : [];
  })
  .catch(async (e) => {
    retryCount++;
    if(retryCount < coingeckoRetryMax) {
      console.error(`error fetching coingecko prices at ${Math.floor(new Date().getTime() / 1000)}, retry #${retryCount}...`, e);
      await sleep(5000);
      return await fetchCoingeckoPriceAtHistoricalRange(assetAddress, network, startTime, endTime, retryCount);
    } else {
      console.error(`retries failed, error fetching coingecko prices at ${Math.floor(new Date().getTime() / 1000)}`, e);
    }
    return {};
  })
  return results;
}

interface ISmallestDiffEntry {
  timeDiff: undefined | number
  timestamp: number
  price: number
}

export const fetchCoinGeckoAssetPriceClosestToTargetTime = async (assetAddress : string, network: string, targetTime: number) => {
  let bufferTargetTimeEachDirection = 3600 * 6; // 6 hours
  let startTime = targetTime - bufferTargetTimeEachDirection;
  let endTime = targetTime + bufferTargetTimeEachDirection;
  let dataInRange = await fetchCoingeckoPriceAtHistoricalRange(assetAddress, network, startTime, endTime);
  let smallestDiffEntry : ISmallestDiffEntry = {
    timeDiff: undefined,
    timestamp: 0,
    price: 0,
  }
  for(let entry of dataInRange) {
    let entryTime = Math.floor(entry[0] / 1000);
    let diff = Math.abs(targetTime - entryTime);
    if((smallestDiffEntry.timeDiff === undefined) || (diff < smallestDiffEntry.timeDiff)) {
        smallestDiffEntry.timeDiff = diff;
        smallestDiffEntry.timestamp = entryTime;
        smallestDiffEntry.price = entry[1];
    }
  }
  return smallestDiffEntry;
}

export {
  sleep,
  srcPath,
  envPath,
  env,
  formatPercentage,
  formatDecimal,
  subgraphRequestWithRetry,
}
