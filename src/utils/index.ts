import path from 'path';
import axios from 'axios';

import BigNumber from 'bignumber.js';

import { 
  SUBGRAPH_ENDPOINT,
  SUBGRAPH_ENDPOINT_FALLBACK,
  COINGECKO_API_KEY,
  NETWORK_ID_TO_COINGECKO_ID,
  PRICE_PROXIES,
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

let unrecognisedTokens : any[] = [];

const subgraphRequestWithRetry = async (query: string, backupQuery: (arg0: string) => string, url = SUBGRAPH_ENDPOINT, fallbackUrl = SUBGRAPH_ENDPOINT_FALLBACK, retryFallback = 3, retryMax = 6, retryCount = 0) : Promise<any> => {
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
      throw new Error(result.errors?.[0].message);
    }
    return result;
  } catch (e: any) {
    retryCount++;
    if(retryCount < retryMax) {
      console.log(`Query failed, retry #${retryCount}`);
      const regex = /latest: (\d+)/g;
      const matches = e.message.match(regex);

      console.log({e})

      if (matches) {
        const latestValues = matches.map((match: string) => parseInt(match.split(': ')[1], 10));
        const highestLatest = Math.max(...latestValues);
        console.log(`The highest "latest" value is: ${highestLatest}`);
        await sleep(4000);
        return await subgraphRequestWithRetry(backupQuery(`${highestLatest}`), backupQuery, retryCount < retryFallback ? url : fallbackUrl, fallbackUrl, retryFallback, retryMax, retryCount);
      } else {
        console.log('No "latest" values found in the error message.');
      }
      await sleep(4000);
      return await subgraphRequestWithRetry(query, backupQuery, retryCount < retryFallback ? url : fallbackUrl, fallbackUrl, retryFallback, retryMax, retryCount);
    } else {
      //@ts-ignore
      throw new Error(e);
    }
  }
}

let coingeckoRetryMax = 10;

export const fetchCoingeckoPriceAtHistoricalRange = async (assetAddress : string, network: string, startTime: number, endTime: number, retryCount = 0) => {

  let {
    assetAddressesQueryString: assetAddressWithOverride,
  } = getCoingeckoOverrides(assetAddress, network);

  let results : number[][] = await axios.get(
    `https://pro-api.coingecko.com/api/v3/coins/${NETWORK_ID_TO_COINGECKO_ID[network]}/contract/${assetAddressWithOverride}/market_chart/range?vs_currency=usd&from=${startTime}&to=${endTime}&x_cg_pro_api_key=${COINGECKO_API_KEY}`,
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
      console.error(`error fetching coingecko prices at ${Math.floor(new Date().getTime() / 1000)}, retry #${retryCount}...`, e?.response?.data?.error === "coin not found" ? "" : e);
      if(e?.response?.data?.error === "coin not found") {
        unrecognisedTokens.push(assetAddressWithOverride);
        console.log({unrecognisedTokens})
        console.log(`skipping retries since coin is not found on ${assetAddressWithOverride}`);
        return {};
      }
      await sleep(5000);
      return await fetchCoingeckoPriceAtHistoricalRange(assetAddressWithOverride, network, startTime, endTime, retryCount);
    } else {
      console.error(`retries failed, error fetching coingecko prices at ${Math.floor(new Date().getTime() / 1000)}`, e);
    }
    console.log({unrecognisedTokens})
    return {};
  })
  console.log({unrecognisedTokens})
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
  if(dataInRange && dataInRange?.length > 0) {
    for(let entry of dataInRange) {
      let entryTime = Math.floor(entry[0] / 1000);
      let diff = Math.abs(targetTime - entryTime);
      if((smallestDiffEntry.timeDiff === undefined) || (diff < smallestDiffEntry.timeDiff)) {
          smallestDiffEntry.timeDiff = diff;
          smallestDiffEntry.timestamp = entryTime;
          smallestDiffEntry.price = entry[1];
      }
    }
  }
  return smallestDiffEntry;
}

const getCoingeckoOverrides = (assetAddressesQueryString : string, network: string) => {
  let originToProxy : {[key: string]: string} = {};
  let proxyToOrigin : {[key: string]: string} = {};
  if(assetAddressesQueryString) {
  let assets = assetAddressesQueryString.split(",");
    for (let asset of assets) {
      let override = PRICE_PROXIES?.[network]?.[asset];
      if(override?.proxyAddress) {
        originToProxy[asset] = override.proxyAddress;
        proxyToOrigin[override.proxyAddress] = asset;
      }
    }
  }
  for(let originAddress of Object.keys(originToProxy)) {
    assetAddressesQueryString = assetAddressesQueryString.replace(originAddress, originToProxy[originAddress]);
  }
  return {assetAddressesQueryString, proxyToOrigin, originToProxy};
}

interface ITimeseriesEntry {
  timestamp: Date;
  network: string;
  deployment_id: string;
  protocol_version: string;
  tvl?: string; // Using string for decimal precision
  borrowed?: string; // Using string for decimal precision
}

export const fillTimeseriesGaps = (data: ITimeseriesEntry[], type: "tvl" | "borrowed", startTime: Date, endTime: Date): ITimeseriesEntry[] => {
  if (data.length === 0) return [];
  
  const filled: ITimeseriesEntry[] = [];
  const twentyMins = 20 * 60 * 1000; // milliseconds in 20 minutes
  const hourly = 3600000; // milliseconds in an hour
  const daily = 24 * hourly; // milliseconds in a day
  
  // Sort data by timestamp
  const sortedData = [...data].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  
  // Calculate time boundaries
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setUTCHours(0, 0, 0, 0);
  
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 7);
  sevenDaysAgo.setUTCHours(0, 0, 0, 0);
  
  // Adjust startTime to 00:00 UTC of its day
  const adjustedStartTime = new Date(startTime);
  adjustedStartTime.setUTCHours(0, 0, 0, 0);
  
  let currentTime = adjustedStartTime.getTime();
  let lastKnownValue = sortedData[0][type];
  let dataIndex = 0;
  
  while (currentTime <= endTime.getTime()) {
    // Update lastKnownValue if we have new data for this timestamp
    while (dataIndex < sortedData.length && 
           sortedData[dataIndex].timestamp.getTime() <= currentTime) {
      lastKnownValue = sortedData[dataIndex][type];
      dataIndex++;
    }
    
    const currentDate = new Date(currentTime);
    const isToday = currentTime >= startOfToday.getTime();
    const isLastWeek = currentTime >= sevenDaysAgo.getTime();
    
    // Determine if we should add this point based on granularity
    const shouldAddPoint = 
      isToday ? currentDate.getUTCMinutes() % 20 === 0 : // Every 20 mins today
      isLastWeek ? currentDate.getUTCMinutes() === 0 : // Every hour last week
      currentDate.getUTCHours() === 0; // Every day for older data
    
    if (shouldAddPoint) {
      filled.push({
        timestamp: new Date(currentTime),
        network: sortedData[0].network,
        deployment_id: sortedData[0].deployment_id,
        protocol_version: sortedData[0].protocol_version,
        [type]: lastKnownValue
      });
    }
    
    // Increment based on time period
    if (isToday) {
      currentTime += twentyMins;
    } else if (isLastWeek) {
      currentTime += hourly;
    } else {
      currentTime += daily;
    }
  }
  
  return filled;
}

export {
  sleep,
  srcPath,
  envPath,
  env,
  formatPercentage,
  formatDecimal,
  subgraphRequestWithRetry,
  getCoingeckoOverrides,
}
