import path from 'path';
import { request } from 'graphql-request';

import { SUBGRAPH_ENDPOINT } from '../constants';

import {
  formatPercentage
} from './numberFormatting';

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

const subgraphRequestWithRetry = async (query: string, url = SUBGRAPH_ENDPOINT, retryMax = 10, retryCount = 0) => {
  try {
    let result = await request(url, query);
    return result;
  } catch (e) {
    retryCount++;
    if(retryCount < retryMax) {
      console.log(`Query failed, retry #${retryCount}`);
      await sleep(1000);
      await subgraphRequestWithRetry(query, url, retryMax, retryCount);
    } else {
      //@ts-ignore
      throw new Error(e);
    }
  }
}

export {
  srcPath,
  envPath,
  env,
  formatPercentage,
  subgraphRequestWithRetry,
}
