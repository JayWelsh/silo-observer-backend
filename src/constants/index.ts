import dotenv from "dotenv";

dotenv.config();

// DB
export const MAX_MINUTELY_RATE_ENTRIES = 1441;

// Subgraph
export const SUBGRAPH_ENDPOINT = "https://api.thegraph.com/subgraphs/id/QmT8631Rt8ZaGtD48F7WP6trs5Wd2RNoacMRPYLfuotDwB";
export const SUBGRAPH_VERSION = "2.0.3";
export const SUBGRAPH_ENDPOINT_FALLBACK = "https://api.thegraph.com/subgraphs/id/QmQV7RB3WUFuSrCSyJsDq6FkQsVYFwak2xCZYsq3JmDrSq";
export const SUBGRAPH_VERSION_FALLBACK = "2.0.2";

export const SUBGRAPH_ENDPOINT_ARBITRUM = "https://api.thegraph.com/subgraphs/id/QmXRY3Gs39AQgdD2bFof5YgqgNLgFNpNAgJAf6Qz99vBBH";

export const NETWORK_TO_SUBGRAPH : {[key: string]: string} = {
  "ethereum": SUBGRAPH_ENDPOINT,
  "arbitrum": SUBGRAPH_ENDPOINT_ARBITRUM,
}

// Web3
export const ALCHEMY_API_KEY = process.env['ALCHEMY_API_KEY'];
export const ALCHEMY_API_KEY_ARBITRUM = process.env['ALCHEMY_API_KEY_ARBITRUM'];
export const ALCHEMY_ENDPOINT = `https://eth-mainnet.g.alchemy.com/v2/${process.env['ALCHEMY_API_KEY']}`;
export const START_BLOCK = 15307294;

export const SILO_FACTORY_ADDRESS = '0x4D919CEcfD4793c0D47866C8d0a02a0950737589';
export const SILO_FACTORY_ADDRESS_ARBITRUM = '0x4166487056A922D784b073d4d928a516B074b719';

export const SILO_LENS_ADDRESS = '0xf12C3758c1eC393704f0Db8537ef7F57368D92Ea';
export const SILO_LENS_ADDRESS_ARBITRUM = '0x07b94eB6AaD663c4eaf083fBb52928ff9A15BE47';

export const NETWORKS = [
  "ethereum",
  "arbitrum"
];

export const NETWORK_TO_MAX_BLOCK_BATCH_SIZE : {[key: string]: number} = {
  "ethereum": 150000,
  "arbitrum": 300000,
}

export const NETWORK_ID_TO_COINGECKO_ID : {[key: string]: string} = {
  "ethereum": "ethereum",
  "arbitrum": "arbitrum-one",
}