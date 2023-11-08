import dotenv from "dotenv";

import {
  IDeployment,
} from '../interfaces';

import SiloFactoryABI from '../web3/abis/SiloFactoryABI.json';
import SiloConvexFactoryABI from '../web3/abis/SiloConvexFactoryABI.json';
import SiloLlamaFactoryABI from '../web3/abis/SiloLlamaFactoryABI.json';
import SiloLensABI from '../web3/abis/SiloLensABI.json';
import SiloLensLlamaABI from '../web3/abis/SiloLensLlamaABI.json';

dotenv.config();

// DB
export const MAX_MINUTELY_RATE_ENTRIES = 1441; // 1 day + 1 second
export const MAX_MINUTELY_TVL_AND_BORROWED_ENTRIES = 10081; // 7 days + 1 second

// CoinGecko
export const COINGECKO_API_KEY = process.env["COINGECKO_API_KEY"];

export const THE_GRAPH_API_KEY = process.env["THE_GRAPH_API_KEY"];

// Subgraph
export const SUBGRAPH_ENDPOINT = `https://gateway-arbitrum.network.thegraph.com/api/${THE_GRAPH_API_KEY}/deployments/id/QmZwDpzNPEdDFMmSghyBC6wZ3aAjJqFB2xrAsrcLCPwVQk`;
export const SUBGRAPH_VERSION = "2.2.8";
export const SUBGRAPH_ENDPOINT_FALLBACK = "https://api.thegraph.com/subgraphs/id/QmQV7RB3WUFuSrCSyJsDq6FkQsVYFwak2xCZYsq3JmDrSq";
export const SUBGRAPH_VERSION_FALLBACK = "2.0.2";

export const SUBGRAPH_ENDPOINT_ARBITRUM = `https://gateway-arbitrum.network.thegraph.com/api/${THE_GRAPH_API_KEY}/deployments/id/QmQqLJVgZLcRduoszARzRi12qGheUTWAHFf3ixMeGm2xML`;

export const SUBGRAPH_ENDPOINT_LLAMA = `https://gateway-arbitrum.network.thegraph.com/api/${THE_GRAPH_API_KEY}/deployments/id/QmYzeik2P18AFNKPtCrEFwuCHws66tjvZpX57KPfKbtnWw`;
export const SUBGRAPH_VERSION_LLAMA = "2.4";

export const NETWORK_TO_SUBGRAPH : {[key: string]: string} = {
  "ethereum": SUBGRAPH_ENDPOINT,
  "arbitrum": SUBGRAPH_ENDPOINT_ARBITRUM,
}

console.log({SUBGRAPH_ENDPOINT, SUBGRAPH_ENDPOINT_ARBITRUM, SUBGRAPH_ENDPOINT_LLAMA})

// Web3
export const ALCHEMY_API_KEY = process.env['ALCHEMY_API_KEY'];
export const ALCHEMY_API_KEY_ARBITRUM = process.env['ALCHEMY_API_KEY_ARBITRUM'];
export const ALCHEMY_ENDPOINT = `https://eth-mainnet.g.alchemy.com/v2/${process.env['ALCHEMY_API_KEY']}`;
export const START_BLOCK = 15307294;

export const SILO_FACTORY_ADDRESS = '0x4D919CEcfD4793c0D47866C8d0a02a0950737589';
export const SILO_LLAMA_FACTORY_ADDRESS = '0x2c0fA05281730EFd3ef71172d8992500B36b56eA';
export const SILO_FACTORY_ADDRESS_ARBITRUM = '0x4166487056A922D784b073d4d928a516B074b719';

export const SILO_CONVEX_FACTORY_ADDRESS = '0x6d4A256695586F61b77B09bc3D28333A91114d5a';

export const SILO_LENS_ADDRESS = '0x0e466FC22386997daC23D1f89A43ecb2CB1e76E9';
export const SILO_LENS_ADDRESS_LLAMA = '0x32a4Bcd8DEa5E18a12a50584682f8E4B77fFF2DF';
export const SILO_LENS_ADDRESS_ARBITRUM = '0x07b94eB6AaD663c4eaf083fBb52928ff9A15BE47';

export const SILO_BLACKLIST = ["0x6543ee07Cf5Dd7Ad17AeECF22ba75860ef3bBAAa"];

export const MAX_TOTAL_BLOCK_RANGE : {[key: string]: number} = {
  "ethereum": 15000000,
  "arbitrum": 30000000,
}

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

export const DEPLOYMENT_CONFIGS : IDeployment[] = [
  {
    id: 'ethereum-original',
    idHumanReadable: "Ethereum Original",
    network: "ethereum",
    siloLens: SILO_LENS_ADDRESS,
    siloLensABI: SiloLensABI,
    siloBlacklist: SILO_BLACKLIST,
    subgraphEndpoint: SUBGRAPH_ENDPOINT,
    siloFactories: [
      {
        address: SILO_FACTORY_ADDRESS,
        abi: SiloFactoryABI,
        meta: 'ethereum-original'
      },
      {
        address: SILO_CONVEX_FACTORY_ADDRESS,
        abi: SiloConvexFactoryABI,
        meta: 'ethereum-convex',
      }
    ],
  },
  {
    id: 'ethereum-llama',
    idHumanReadable: "Ethereum LLAMA",
    network: "ethereum",
    siloLens: SILO_LENS_ADDRESS_LLAMA,
    siloLensABI: SiloLensLlamaABI,
    siloBlacklist: SILO_BLACKLIST,
    subgraphEndpoint: SUBGRAPH_ENDPOINT_LLAMA,
    siloFactories: [
      {
        address: SILO_LLAMA_FACTORY_ADDRESS,
        abi: SiloLlamaFactoryABI,
        meta: 'ethereum-llama'
      },
    ],
  },
  {
    id: 'arbitrum-original',
    idHumanReadable: "Arbitrum Original",
    network: "arbitrum",
    siloLens: SILO_LENS_ADDRESS_ARBITRUM,
    siloLensABI: SiloLensABI,
    siloBlacklist: SILO_BLACKLIST,
    subgraphEndpoint: SUBGRAPH_ENDPOINT_ARBITRUM,
    siloFactories: [{
      address: SILO_FACTORY_ADDRESS_ARBITRUM,
      abi: SiloFactoryABI,
      meta: "arbitrum-original",
    }],
  }
]