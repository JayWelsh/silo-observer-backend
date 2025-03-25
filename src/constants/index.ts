import dotenv from "dotenv";

import {
  IDeployment,
} from '../interfaces';

import SiloFactoryABI from '../web3/abis/SiloFactoryABI.json';
import SiloFactoryV2ABI from '../web3/abis/SiloFactoryV2ABI.json';
import SiloFactoryMainABI from '../web3/abis/SiloFactoryMainABI.json';
import SiloConvexFactoryABI from '../web3/abis/SiloConvexFactoryABI.json';
import SiloLlamaFactoryABI from '../web3/abis/SiloLlamaFactoryABI.json';
import SiloLensABI from '../web3/abis/SiloLensABI.json';
import SiloLensV2ABI from '../web3/abis/SiloLensV2ABI.json';
import SiloLensMainABI from '../web3/abis/SiloLensMainABI.json';
import SiloLensLlamaABI from '../web3/abis/SiloLensLlamaABI.json';
import SiloLensBaseBtcfiABI from '../web3/abis/SiloLensBaseBtcfiABI.json'
import SiloRepositoryABI from '../web3/abis/SiloRepositoryABI.json';
import SiloRepositoryBaseBtcfiABI from '../web3/abis/SiloRepositoryBaseBtcfiABI.json';
import SiloRepositoryMainABI from '../web3/abis/SiloRepositoryMainABI.json';

dotenv.config();

// DB
export const MAX_MINUTELY_RATE_ENTRIES = 1441; // 1 day + 1 second
export const MAX_MINUTELY_TVL_AND_BORROWED_ENTRIES = 10081; // 7 days + 1 second

// CoinGecko
export const COINGECKO_API_KEY = process.env["COINGECKO_API_KEY"];

export const THE_GRAPH_API_KEY = process.env["THE_GRAPH_API_KEY"];
export const TURTLE_THE_GRAPH_API_KEY = process.env["TURTLE_THE_GRAPH_API_KEY"];

// Subgraph
// export const SUBGRAPH_ENDPOINT = `https://gateway-arbitrum.network.thegraph.com/api/${THE_GRAPH_API_KEY}/deployments/id/QmZwDpzNPEdDFMmSghyBC6wZ3aAjJqFB2xrAsrcLCPwVQk`;
// export const SUBGRAPH_VERSION = "2.2.8";
// export const SUBGRAPH_ENDPOINT_FALLBACK = "https://api.thegraph.com/subgraphs/id/QmQV7RB3WUFuSrCSyJsDq6FkQsVYFwak2xCZYsq3JmDrSq";
// export const SUBGRAPH_VERSION_FALLBACK = "2.0.2";
export const SUBGRAPH_ENDPOINT = `https://gateway-arbitrum.network.thegraph.com/api/${THE_GRAPH_API_KEY}/deployments/id/QmeDLbKHYypURMRigRxSspUm8w5zrDfXc3Skw2PiDxqCFu`;
export const SUBGRAPH_ENDPOINT_TURTLE = `https://gateway-arbitrum.network.thegraph.com/api/${TURTLE_THE_GRAPH_API_KEY}/deployments/id/QmeDLbKHYypURMRigRxSspUm8w5zrDfXc3Skw2PiDxqCFu`;
export const SUBGRAPH_ENDPOINT_FALLBACK = `https://api.thegraph.com/subgraphs/id/QmeDLbKHYypURMRigRxSspUm8w5zrDfXc3Skw2PiDxqCFu`;
export const SUBGRAPH_VERSION = "3.5.1";

export const SUBGRAPH_ENDPOINT_MAIN = `https://gateway-arbitrum.network.thegraph.com/api/${THE_GRAPH_API_KEY}/deployments/id/QmcYjagkzh7KiFKoLzeXs5SGynz7iMPVRnSdVPYiCUrLGq`;
export const SUBGRAPH_ENDPOINT_MAIN_TURTLE = `https://gateway-arbitrum.network.thegraph.com/api/${TURTLE_THE_GRAPH_API_KEY}/deployments/id/QmcYjagkzh7KiFKoLzeXs5SGynz7iMPVRnSdVPYiCUrLGq`;
export const SUBGRAPH_ENDPOINT_MAIN_FALLBACK = `https://api.thegraph.com/subgraphs/id/QmcYjagkzh7KiFKoLzeXs5SGynz7iMPVRnSdVPYiCUrLGq`;
export const SUBGRAPH_VERSION_MAIN = "3.5.1";

// export const SUBGRAPH_ENDPOINT_ARBITRUM = `https://api.thegraph.com/subgraphs/id/QmQqLJVgZLcRduoszARzRi12qGheUTWAHFf3ixMeGm2xML`;
// export const SUBGRAPH_ENDPOINT_ARBITRUM = `https://gateway-arbitrum.network.thegraph.com/api/${THE_GRAPH_API_KEY}/deployments/id/QmQqLJVgZLcRduoszARzRi12qGheUTWAHFf3ixMeGm2xML`;
export const SUBGRAPH_ENDPOINT_ARBITRUM = `https://gateway-arbitrum.network.thegraph.com/api/${THE_GRAPH_API_KEY}/deployments/id/QmYtYfMeMcS2YBugkQ5fh6CcidQrKL3PHUEc7HnyYCW6Gc`;
export const SUBGRAPH_ENDPOINT_ARBITRUM_TURTLE = `https://gateway-arbitrum.network.thegraph.com/api/${TURTLE_THE_GRAPH_API_KEY}/deployments/id/QmYtYfMeMcS2YBugkQ5fh6CcidQrKL3PHUEc7HnyYCW6Gc`;
export const SUBGRAPH_ENDPOINT_ARBITRUM_FALLBACK = `https://api.thegraph.com/subgraphs/id/QmYtYfMeMcS2YBugkQ5fh6CcidQrKL3PHUEc7HnyYCW6Gc`;
export const SUBGRAPH_VERSION_ARBITRUM = "3.8.1.1";

export const SUBGRAPH_ENDPOINT_OPTIMISM = `https://gateway-arbitrum.network.thegraph.com/api/${THE_GRAPH_API_KEY}/deployments/id/Qmb4EVvFzGefGp3br5ozffT9yJ1vKptbawypqMPd7MctBh`;
export const SUBGRAPH_ENDPOINT_OPTIMISM_TURTLE = `https://gateway-arbitrum.network.thegraph.com/api/${TURTLE_THE_GRAPH_API_KEY}/deployments/id/Qmb4EVvFzGefGp3br5ozffT9yJ1vKptbawypqMPd7MctBh`;
export const SUBGRAPH_ENDPOINT_OPTIMISM_FALLBACK = `https://api.thegraph.com/subgraphs/id/Qmb4EVvFzGefGp3br5ozffT9yJ1vKptbawypqMPd7MctBh`;
export const SUBGRAPH_VERSION_OPTIMISM = "3.5.1";

// export const SUBGRAPH_ENDPOINT_LLAMA = `https://gateway-arbitrum.network.thegraph.com/api/${THE_GRAPH_API_KEY}/deployments/id/QmYzeik2P18AFNKPtCrEFwuCHws66tjvZpX57KPfKbtnWw`;
// export const SUBGRAPH_VERSION_LLAMA = "2.4";
export const SUBGRAPH_ENDPOINT_LLAMA = `https://gateway-arbitrum.network.thegraph.com/api/${THE_GRAPH_API_KEY}/deployments/id/QmU6W7w6gAjDoE637hAVLjizp2cc7RYtUQsEzKnGp26VVa`;
export const SUBGRAPH_ENDPOINT_LLAMA_TURTLE = `https://gateway-arbitrum.network.thegraph.com/api/${TURTLE_THE_GRAPH_API_KEY}/deployments/id/QmU6W7w6gAjDoE637hAVLjizp2cc7RYtUQsEzKnGp26VVa`;
export const SUBGRAPH_ENDPOINT_LLAMA_FALLBACK = `https://api.thegraph.com/subgraphs/id/QmU6W7w6gAjDoE637hAVLjizp2cc7RYtUQsEzKnGp26VVa`;
export const SUBGRAPH_VERSION_LLAMA = "3.5.1";

// BASE
export const SUBGRAPH_ENDPOINT_BASE = `https://gateway-arbitrum.network.thegraph.com/api/${THE_GRAPH_API_KEY}/deployments/id/QmTqzhfBYLdVNA3P5BCuYyanKvGAEUjWVZUieAe6dcRCDv`;
export const SUBGRAPH_ENDPOINT_BASE_TURTLE = `https://gateway-arbitrum.network.thegraph.com/api/${TURTLE_THE_GRAPH_API_KEY}/deployments/id/QmTqzhfBYLdVNA3P5BCuYyanKvGAEUjWVZUieAe6dcRCDv`;
export const SUBGRAPH_ENDPOINT_BASE_FALLBACK = `https://api.thegraph.com/subgraphs/id/QmTqzhfBYLdVNA3P5BCuYyanKvGAEUjWVZUieAe6dcRCDv`;
export const SUBGRAPH_VERSION_BASE = "3.5.1";

export const SUBGRAPH_ENDPOINT_BASE_BTCFI = `https://gateway-arbitrum.network.thegraph.com/api/${THE_GRAPH_API_KEY}/deployments/id/QmYHjei6Z71YcuSnk5KuXXv1tr5aqfUiL2gQMukeA9B1eF`;
export const SUBGRAPH_ENDPOINT_BASE_TURTLE_BTCFI = `https://gateway-arbitrum.network.thegraph.com/api/${TURTLE_THE_GRAPH_API_KEY}/deployments/id/QmYHjei6Z71YcuSnk5KuXXv1tr5aqfUiL2gQMukeA9B1eF`;
export const SUBGRAPH_ENDPOINT_BASE_FALLBACK_BTCFI = `https://api.thegraph.com/subgraphs/id/QmYHjei6Z71YcuSnk5KuXXv1tr5aqfUiL2gQMukeA9B1eF`;
export const SUBGRAPH_VERSION_BASE_BTCFI = "3.8.1";

export const NETWORK_TO_SUBGRAPH : {[key: string]: string} = {
  "ethereum": SUBGRAPH_ENDPOINT,
  "arbitrum": SUBGRAPH_ENDPOINT_ARBITRUM,
  "optimism": SUBGRAPH_ENDPOINT_OPTIMISM,
  "base": SUBGRAPH_ENDPOINT_BASE,
}

export const CHAIN_ID_TO_CHAIN_NAME : {[key: number]: string} = {
  1: "ethereum",
  10: "optimism",
  42161: "arbitrum",
  8453: "base",
}

export const CHAIN_NAME_TO_CHAIN_ID = {
  "ethereum": 1,
  "optimism": 10,
  "arbitrum": 42161,
  "base": 8453,
}

// Web3
export const ALCHEMY_API_KEY = process.env['ALCHEMY_API_KEY'];
export const ALCHEMY_API_KEY_ARBITRUM = process.env['ALCHEMY_API_KEY_ARBITRUM'];
export const ALCHEMY_API_KEY_OPTIMISM = process.env['ALCHEMY_API_KEY_OPTIMISM'];
export const ALCHEMY_API_KEY_BASE = process.env['ALCHEMY_API_KEY_BASE'];
export const ALCHEMY_API_KEY_SONIC = process.env['ALCHEMY_API_KEY_SONIC'];
export const ALCHEMY_ENDPOINT = `https://eth-mainnet.g.alchemy.com/v2/${process.env['ALCHEMY_API_KEY']}`;
export const START_BLOCK = 15307294;

export const NETWORK_TO_ALCHEMY_ENDPOINT: {[key: string]: string} = {
  "ethereum": `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
  "arbitrum": `https://arb-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY_ARBITRUM}`,
  "optimism": `https://opt-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY_OPTIMISM}`,
  "base": `https://base-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY_BASE}`,
  "sonic": `https://sonic-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY_SONIC}`,
}

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

// ETHEREUM

export const SILO_FACTORY_ADDRESS = '0x4D919CEcfD4793c0D47866C8d0a02a0950737589';
export const SILO_REPOSITORY_ADDRESS = "0xd998C35B7900b344bbBe6555cc11576942Cf309d";
export const SILO_LENS_ADDRESS = '0x0e466FC22386997daC23D1f89A43ecb2CB1e76E9';

export const SILO_LLAMA_FACTORY_ADDRESS = '0x2c0fA05281730EFd3ef71172d8992500B36b56eA';
export const SILO_LLAMA_REPOSITORY_ADDRESS = '0xBCd67f35c7A2F212db0AD7f68fC773b5aC15377c';
export const SILO_LENS_ADDRESS_LLAMA = '0x32a4Bcd8DEa5E18a12a50584682f8E4B77fFF2DF';

export const SILO_FACTORY_MAIN_ADDRESS = '0xB7d391192080674281bAAB8B3083154a5f64cd0a';
export const SILO_REPOSITORY_MAIN_ADDRESS = '0xbACBBefda6fD1FbF5a2d6A79916F4B6124eD2D49';
export const SILO_LENS_MAIN_ADDRESS = '0x331243a425F7EE2468f0FddCe5cD83f58733Cc1C';

// ARBITRUM

export const SILO_FACTORY_ADDRESS_ARBITRUM = '0x4166487056A922D784b073d4d928a516B074b719';
export const SILO_REPOSITORY_ADDRESS_ARBITRUM = "0x8658047e48CC09161f4152c79155Dac1d710Ff0a";
export const SILO_LENS_ADDRESS_ARBITRUM = '0x07b94eB6AaD663c4eaf083fBb52928ff9A15BE47';

export const SILO_FACTORY_V2_ADDRESS_ARBITRUM = '0xf7dc975C96B434D436b9bF45E7a45c95F0521442';
export const SILO_LENS_V2_ADDRESS_ARBITRUM = '0xc27B33c022935e88BDDe22a417c509010A7d97E4';

// OPTIMISM

export const SILO_FACTORY_ADDRESS_OPTIMISM = '0x6B14c4450a29Dd9562c20259eBFF67a577b540b9';
export const SILO_REPOSITORY_ADDRESS_OPTIMISM = "0xD2767dAdED5910bbc205811FdbD2eEFd460AcBe9";
export const SILO_LENS_ADDRESS_OPTIMISM = '0xd3De080436b9d38DC315944c16d89C050C414Fed';

// BASE

export const SILO_FACTORY_ADDRESS_BASE = '0x408822E4E8682413666809b0655161093cd36f2b';
export const SILO_REPOSITORY_ADDRESS_BASE = '0xa42001D6d2237d2c74108FE360403C4b796B7170';
export const SILO_LENS_ADDRESS_BASE = '0x196D312fd81412B6443620Ca81B41103b4E123FD';

export const SILO_FACTORY_ADDRESS_BASE_BTCFI = '0x2899b0C131225CbcE912Ba14Bbb7e1C88f2462B5';
export const SILO_REPOSITORY_ADDRESS_BASE_BTCFI = '0x1E915d8950f0C6bf9d01C603D33c50b6110beDA3';
export const SILO_LENS_ADDRESS_BASE_BTCFI = '0xE89D07da1438177eaa0AE7277D7D9A4dDdc16C0F';

// SONIC
export const SILO_FACTORY_V2_ADDRESS_SONIC = '0xa42001D6d2237d2c74108FE360403C4b796B7170';
export const SILO_LENS_V2_ADDRESS_SONIC = '0xB6AdBb29f2D8ae731C7C72036A7FD5A7E970B198';

export const SILO_CONVEX_FACTORY_ADDRESS = '0x6d4A256695586F61b77B09bc3D28333A91114d5a';

export const SILO_BLACKLIST = ["0x6543ee07Cf5Dd7Ad17AeECF22ba75860ef3bBAAa"];

export const MAX_TOTAL_BLOCK_RANGE : {[key: string]: number} = {
  "ethereum": 1500000,
  "arbitrum": 3500000,
  "optimism": 3500000,
  "base": 3500000,
  "sonic": 3500000,
}

export const MAX_TOTAL_BLOCK_RANGE_SUBGRAPH : {[key: string]: number} = {
  "ethereum": 15000000,
  "arbitrum": 35000000,
  "optimism": 35000000,
  "base": 35000000,
  "sonic": 35000000,
}

export const NETWORKS = [
  "ethereum",
  "arbitrum",
  "optimism",
  "base",
  "sonic",
];

export const NETWORK_TO_MAX_BLOCK_BATCH_SIZE : {[key: string]: number} = {
  "ethereum": 150000,
  "arbitrum": 300000,
  "optimism": 300000,
  "base": 300000,
  "sonic": 300000,
}

export const NETWORK_ID_TO_COINGECKO_ID : {[key: string]: string} = {
  "ethereum": "ethereum",
  "arbitrum": "arbitrum-one",
  "optimism": "optimistic-ethereum",
  "base": "base",
  "sonic": "sonic",
  "binance-smart-chain": "binance-smart-chain",
}

export const DEPLOYMENT_CONFIGS : IDeployment[] = [
  {
    protocolVersion: 1,
    id: 'ethereum-original',
    idHumanReadable: "Ethereum Legacy",
    network: "ethereum",
    siloLens: SILO_LENS_ADDRESS,
    siloLensABI: SiloLensABI,
    siloBlacklist: SILO_BLACKLIST,
    subgraphEndpoint: SUBGRAPH_ENDPOINT,
    subgraphEndpointFallback: SUBGRAPH_ENDPOINT_FALLBACK,
    subgraphEndpointTurtle: SUBGRAPH_ENDPOINT_TURTLE,
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
    incentiveControllers: [
      {
        address: "0x6c1603aB6CecF89DD60C24530DdE23F97DA3C229",
        assetAddress: "0x6f80310CA7F2C654691D1383149Fa1A57d8AB1f8",
        meta: "silo_rewards_q1_2023"
      },
    ],
    siloRepository: {
      address: SILO_REPOSITORY_ADDRESS,
      abi: SiloRepositoryABI,
      meta: 'ethereum-original-and-convex'
    },
  },
  {
    protocolVersion: 1,
    id: 'ethereum-main',
    idHumanReadable: "Ethereum Main",
    network: "ethereum",
    siloLens: SILO_LENS_MAIN_ADDRESS,
    siloLensABI: SiloLensMainABI,
    siloBlacklist: SILO_BLACKLIST,
    subgraphEndpoint: SUBGRAPH_ENDPOINT_MAIN,
    subgraphEndpointFallback: SUBGRAPH_ENDPOINT_MAIN_FALLBACK,
    subgraphEndpointTurtle: SUBGRAPH_ENDPOINT_MAIN_TURTLE,
    siloFactories: [
      {
        address: SILO_FACTORY_MAIN_ADDRESS,
        abi: SiloFactoryMainABI,
        meta: 'ethereum-main'
      }
    ],
    incentiveControllers: [
      {
        address: "0xB14F20982F2d1E5933362f5A796736D9ffa220E4",
        assetAddress: "0x6f80310CA7F2C654691D1383149Fa1A57d8AB1f8",
        meta: "silo_rewards_main_q4_2024"
      },
    ],
    siloRepository: {
      address: SILO_REPOSITORY_MAIN_ADDRESS,
      abi: SiloRepositoryMainABI,
      meta: 'ethereum-main'
    },
  },
  {
    protocolVersion: 1,
    id: 'ethereum-llama',
    idHumanReadable: "Ethereum LLAMA",
    network: "ethereum",
    siloLens: SILO_LENS_ADDRESS_LLAMA,
    siloLensABI: SiloLensLlamaABI,
    siloBlacklist: SILO_BLACKLIST,
    subgraphEndpoint: SUBGRAPH_ENDPOINT_LLAMA,
    subgraphEndpointFallback: SUBGRAPH_ENDPOINT_LLAMA_FALLBACK,
    subgraphEndpointTurtle: SUBGRAPH_ENDPOINT_LLAMA_TURTLE,
    siloFactories: [
      {
        address: SILO_LLAMA_FACTORY_ADDRESS,
        abi: SiloLlamaFactoryABI,
        meta: 'ethereum-llama'
      },
    ],
    siloRepository: {
      address: SILO_LLAMA_REPOSITORY_ADDRESS,
      abi: SiloRepositoryABI,
      meta: 'ethereum-llama-repository'
    },
  },
  {
    protocolVersion: 1,
    id: 'arbitrum-original',
    idHumanReadable: "Arbitrum Original",
    network: "arbitrum",
    siloLens: SILO_LENS_ADDRESS_ARBITRUM,
    siloLensABI: SiloLensABI,
    siloBlacklist: SILO_BLACKLIST,
    subgraphEndpoint: SUBGRAPH_ENDPOINT_ARBITRUM,
    subgraphEndpointFallback: SUBGRAPH_ENDPOINT_ARBITRUM_FALLBACK,
    subgraphEndpointTurtle: SUBGRAPH_ENDPOINT_ARBITRUM_TURTLE,
    siloFactories: [{
      address: SILO_FACTORY_ADDRESS_ARBITRUM,
      abi: SiloFactoryABI,
      meta: "arbitrum-original",
    }],
    incentiveControllers: [
      {
        address: "0xd592F705bDC8C1B439Bd4D665Ed99C4FaAd5A680",
        assetAddress: "0x912CE59144191C1204E64559FE8253a0e49E6548",
        meta: "arb_rewards_q4_2023"
      },
      {
        address: "0x7e5BFBb25b33f335e34fa0d78b878092931F8D20",
        assetAddress: "0x0341C0C0ec423328621788d4854119B97f44E391",
        meta: "silo_rewards_q1_2024"
      }
    ],
    siloRepository: {
      address: SILO_REPOSITORY_ADDRESS_ARBITRUM,
      abi: SiloRepositoryABI,
      meta: 'arbitrum-repository'
    },
  },
  {
    protocolVersion: 1,
    id: 'optimism-original',
    idHumanReadable: "Optimism Original",
    network: "optimism",
    siloLens: SILO_LENS_ADDRESS_OPTIMISM,
    siloLensABI: SiloLensABI,
    siloBlacklist: SILO_BLACKLIST,
    subgraphEndpoint: SUBGRAPH_ENDPOINT_OPTIMISM,
    subgraphEndpointFallback: SUBGRAPH_ENDPOINT_OPTIMISM_FALLBACK,
    subgraphEndpointTurtle: SUBGRAPH_ENDPOINT_OPTIMISM_TURTLE,
    siloFactories: [{
      address: SILO_FACTORY_ADDRESS_OPTIMISM,
      abi: SiloFactoryABI,
      meta: "optimism-original",
    }],
    incentiveControllers: [
      {
        address: "0x847D9420643e117798e803d9C5F0e406277CB622",
        assetAddress: "0x4200000000000000000000000000000000000042",
        meta: "op_rewards_q1_2024"
      },
    ],
    siloRepository: {
      address: SILO_REPOSITORY_ADDRESS_OPTIMISM,
      abi: SiloRepositoryABI,
      meta: 'optimism-repository'
    },
  },
  {
    protocolVersion: 1,
    id: 'base-original',
    idHumanReadable: "Base Original",
    network: "base",
    siloLens: SILO_LENS_ADDRESS_BASE,
    siloLensABI: SiloLensABI,
    siloBlacklist: SILO_BLACKLIST,
    subgraphEndpoint: SUBGRAPH_ENDPOINT_BASE,
    subgraphEndpointFallback: SUBGRAPH_ENDPOINT_BASE_FALLBACK,
    subgraphEndpointTurtle: SUBGRAPH_ENDPOINT_BASE_TURTLE,
    siloFactories: [{
      address: SILO_FACTORY_ADDRESS_BASE,
      abi: SiloFactoryABI,
      meta: "base-original",
    }],
    siloRepository: {
      address: SILO_REPOSITORY_ADDRESS_BASE,
      abi: SiloRepositoryABI,
      meta: 'base-repository'
    },
  },
  {
    protocolVersion: 1,
    id: 'base-btcfi',
    idHumanReadable: "Base BTCfi",
    network: "base",
    siloLens: SILO_LENS_ADDRESS_BASE_BTCFI,
    siloLensABI: SiloLensBaseBtcfiABI,
    siloBlacklist: SILO_BLACKLIST,
    subgraphEndpoint: SUBGRAPH_ENDPOINT_BASE_BTCFI,
    subgraphEndpointFallback: SUBGRAPH_ENDPOINT_BASE_FALLBACK_BTCFI,
    subgraphEndpointTurtle: SUBGRAPH_ENDPOINT_BASE_TURTLE_BTCFI,
    siloFactories: [{
      address: SILO_FACTORY_ADDRESS_BASE_BTCFI,
      abi: SiloFactoryABI,
      meta: "base-btcfi",
    }],
    siloRepository: {
      address: SILO_REPOSITORY_ADDRESS_BASE_BTCFI,
      abi: SiloRepositoryBaseBtcfiABI,
      meta: 'base-btcfi-repository'
    },
  },
  {
    protocolVersion: 2,
    id: 'sonic-main-v2',
    idHumanReadable: 'Sonic Main V2',
    network: 'sonic',
    siloLens: SILO_LENS_V2_ADDRESS_SONIC,
    siloLensABI: SiloLensV2ABI,
    siloBlacklist: [],
    // subgraphEndpoint: '',
    // subgraphEndpointFallback: '',
    siloFactories: [
      {
        address: SILO_FACTORY_V2_ADDRESS_SONIC,
        abi: SiloFactoryV2ABI,
        meta: 'sonic-main-v2'
      }
    ],
  },
  // {
  //   protocolVersion: 2,
  //   id: 'arbitrum-main-v2',
  //   idHumanReadable: 'Arbitrum Main V2',
  //   network: 'arbitrum',
  //   siloLens: SILO_LENS_V2_ADDRESS_ARBITRUM,
  //   siloLensABI: SiloLensV2ABI,
  //   siloBlacklist: [],
  //   // subgraphEndpoint: '',
  //   // subgraphEndpointFallback: '',
  //   siloFactories: [
  //     {
  //       address: SILO_FACTORY_V2_ADDRESS_ARBITRUM,
  //       abi: SiloFactoryV2ABI,
  //       meta: 'arbitrum-main-v2'
  //     }
  //   ],
  // },
]

// TODO: Add support for proxies between chains, will require update to fetchCoingeckoPrices

export const PRICE_PROXIES : {[key: string]: {[key: string]: {proxyAddress: string, proxyNetwork?: string}}} = {
  ethereum: {
    "0xeEE8aED1957ca1545a0508AfB51b53cCA7e3c0d1": { // PT-ezETH-25APR2024
      proxyAddress: "0xbf5495Efe5DB9ce00f80364C8B423567e58d2110",
      // proxyNetwork: "ethereum",
    },
    "0x5cb12D56F5346a016DBBA8CA90635d82e6D1bcEa": { // PT-rswETH-27JUN2024
      proxyAddress: "0xFAe103DC9cf190eD75350761e95403b7b8aFa6c0",
    },
    "0xB05cABCd99cf9a73b19805edefC5f67CA5d1895E": { // PT-rsETH-27JUN2024
      proxyAddress: "0xA1290d69c65A6Fe4DF752f95823fae25cB99e5A7",
    },
    "0x5fD13359Ba15A84B76f7F87568309040176167cd": { // amphrETH
      proxyAddress: "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0", // wstETH
    },
    "0x84631c0d0081FDe56DeB72F6DE77abBbF6A9f93a": { // Re7LRT
      proxyAddress: "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0", // wstETH
    },
    "0x6c9f097e044506712B58EAC670c9a5fd4BCceF13": { // PT-sUSDE-26SEP2024
      proxyAddress: "0x9D39A5DE30e57443BfF2A8307A4256c8797A3497" // sUSDe
    },
    "0x1c085195437738d73d75DC64bC5A3E098b7f93b1": { // PT-weETH-26SEP2024
      proxyAddress: "0xCd5fE23C85820F7B72D0926FC9b05b43E359b7ee" // weETH
    },
    "0x248241244356D18f63d0c16082996839ecB0C7bF": { // PT-ezETH-26SEP2024
      proxyAddress: "0xbf5495Efe5DB9ce00f80364C8B423567e58d2110", // ezETH
    },
    "0xd4e75971eAF78a8d93D96df530f1FFf5f9F53288": { // PT-pufETH-26SEP2024
      proxyAddress: "0xD9A442856C234a39a81a089C06451EBAa4306a72" // pufETH
    }
  },
  arbitrum: {
    "0x8EA5040d423410f1fdc363379Af88e1DB5eA1C34": { // PT-ezETH-27JUN2024
      proxyAddress: "0x2416092f143378750bb29b79eD961ab195CcEea5",
      // proxyNetwork: "arbitrum",
    },
    "0x9bEcd6b4Fb076348A455518aea23d3799361FE95": { // PT-weETH-25APR2024
      proxyAddress: "0x35751007a407ca6FEFfE80b3cB397736D2cf4dbe",
      // proxyNetwork: "arbitrum",
    },
    "0x1c27Ad8a19Ba026ADaBD615F6Bc77158130cfBE4": {// PT-weETH-27JUN2024
      proxyAddress: "0x35751007a407ca6FEFfE80b3cB397736D2cf4dbe",
    },
    // "0xAFD22F824D51Fb7EeD4778d303d4388AC644b026": { // PT-rsETH-27JUN2024
    //   proxyAddress: "", // needs coingecko link to arbitrum token
    // }
  },
  sonic: {
    "0x541FD749419CA806a8bc7da8ac23D346f2dF8B77": {
      proxyAddress: "0x7A56E1C57C7475CCf742a1832B028F0456652F97",
      proxyNetwork: "ethereum",
    },
    "0xCC0966D8418d412c599A6421b760a847eB169A8c": {
      proxyAddress: "0x1346b618dC92810EC74163e4c27004c921D446a5",
      proxyNetwork: "binance-smart-chain",
    },
    "0x9fb76f7ce5FCeAA2C42887ff441D46095E494206": {
      proxyAddress: "0xd3DCe716f3eF535C5Ff8d041c1A41C3bd89b97aE",
    },
    "0xE8a41c62BB4d5863C6eadC96792cFE90A1f37C47": {
      proxyAddress: "0x3bcE5CB273F0F148010BbEa2470e7b5df84C7812",
    },
    "0xBe27993204Ec64238F71A527B4c4D5F4949034C3": { // PT-wstkscUSD (29 May)
      proxyAddress: "0xd3dce716f3ef535c5ff8d041c1a41c3bd89b97ae", // scUSD
    },
    "0x420df605D062F8611EFb3F203BF258159b8FfFdE": { // PT-stS (29 May)
      proxyAddress: "0xe5da20f15420ad15de0fa650600afc998bbe3955", // stS
    },
    "0x930441Aa7Ab17654dF5663781CA0C02CC17e6643": { // PT-aUSDC (14 Aug)
      proxyAddress: "0x98c23e9d8f34fefb1b7bd6a91b7ff122f4e16f5c", // Aave v3 USDC
      proxyNetwork: "ethereum",
    },
    "0xa2161E75EDf50d70544e6588788A5732A3105c00": { // PT-wstkscETH (29 May)
      proxyAddress: "0x3bce5cb273f0f148010bbea2470e7b5df84c7812", // scETH
    },
    "0x46eb02b9F47634c4fab3110CC7ADc1C6311DfAC1": { // PT-wOS (29 May)
      proxyAddress: "0x9f0df7799f6fdad409300080cff680f5a23df4b1", // wOS
    },
    "0xBb30e76d9Bb2CC9631F7fC5Eb8e87B5Aff32bFbd": { // scBTC
      proxyAddress: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599", // wBTC
      proxyNetwork: "ethereum",
    },
    "0xfA85Fe5A8F5560e9039C04f2b0a90dE1415aBD70": { // wanS
      proxyAddress: "0x039e2fb66102314ce7b64ce5ce3e5183bc94ad38", // wS
    }
  }
}