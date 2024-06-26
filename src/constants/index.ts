import dotenv from "dotenv";

import {
  IDeployment,
} from '../interfaces';

import SiloFactoryABI from '../web3/abis/SiloFactoryABI.json';
import SiloConvexFactoryABI from '../web3/abis/SiloConvexFactoryABI.json';
import SiloLlamaFactoryABI from '../web3/abis/SiloLlamaFactoryABI.json';
import SiloLensABI from '../web3/abis/SiloLensABI.json';
import SiloLensLlamaABI from '../web3/abis/SiloLensLlamaABI.json';
import SiloRepositoryABI from '../web3/abis/SiloRepositoryABI.json';

dotenv.config();

// DB
export const MAX_MINUTELY_RATE_ENTRIES = 1441; // 1 day + 1 second
export const MAX_MINUTELY_TVL_AND_BORROWED_ENTRIES = 10081; // 7 days + 1 second

// CoinGecko
export const COINGECKO_API_KEY = process.env["COINGECKO_API_KEY"];

export const THE_GRAPH_API_KEY = process.env["THE_GRAPH_API_KEY"];

// Subgraph
// export const SUBGRAPH_ENDPOINT = `https://gateway-arbitrum.network.thegraph.com/api/${THE_GRAPH_API_KEY}/deployments/id/QmZwDpzNPEdDFMmSghyBC6wZ3aAjJqFB2xrAsrcLCPwVQk`;
// export const SUBGRAPH_VERSION = "2.2.8";
// export const SUBGRAPH_ENDPOINT_FALLBACK = "https://api.thegraph.com/subgraphs/id/QmQV7RB3WUFuSrCSyJsDq6FkQsVYFwak2xCZYsq3JmDrSq";
// export const SUBGRAPH_VERSION_FALLBACK = "2.0.2";
export const SUBGRAPH_ENDPOINT = `https://gateway-arbitrum.network.thegraph.com/api/${THE_GRAPH_API_KEY}/deployments/id/QmeDLbKHYypURMRigRxSspUm8w5zrDfXc3Skw2PiDxqCFu`;
export const SUBGRAPH_ENDPOINT_FALLBACK = `https://api.thegraph.com/subgraphs/id/QmeDLbKHYypURMRigRxSspUm8w5zrDfXc3Skw2PiDxqCFu`;
export const SUBGRAPH_VERSION = "3.5.1";

// export const SUBGRAPH_ENDPOINT_ARBITRUM = `https://api.thegraph.com/subgraphs/id/QmQqLJVgZLcRduoszARzRi12qGheUTWAHFf3ixMeGm2xML`;
// export const SUBGRAPH_ENDPOINT_ARBITRUM = `https://gateway-arbitrum.network.thegraph.com/api/${THE_GRAPH_API_KEY}/deployments/id/QmQqLJVgZLcRduoszARzRi12qGheUTWAHFf3ixMeGm2xML`;
export const SUBGRAPH_ENDPOINT_ARBITRUM = `https://gateway-arbitrum.network.thegraph.com/api/${THE_GRAPH_API_KEY}/deployments/id/QmTMKqty5yZvZtB3SwzXUG92aZUH1YQw3VjByGw4wgaMhW`;
export const SUBGRAPH_ENDPOINT_ARBITRUM_FALLBACK = `https://api.thegraph.com/subgraphs/id/QmTMKqty5yZvZtB3SwzXUG92aZUH1YQw3VjByGw4wgaMhW`;
export const SUBGRAPH_VERSION_ARBITRUM = "3.5.1";

export const SUBGRAPH_ENDPOINT_OPTIMISM = `https://gateway-arbitrum.network.thegraph.com/api/${THE_GRAPH_API_KEY}/deployments/id/QmQapCKp7Ux411BdULtXBrL8VRjdEqq8inwJd3Fqi6BwEV`; // TODO find correct subgraph ID
export const SUBGRAPH_ENDPOINT_OPTIMISM_FALLBACK = `https://api.thegraph.com/subgraphs/id/QmQapCKp7Ux411BdULtXBrL8VRjdEqq8inwJd3Fqi6BwEV`;
export const SUBGRAPH_VERSION_OPTIMISM = "3.5.1";

// export const SUBGRAPH_ENDPOINT_LLAMA = `https://gateway-arbitrum.network.thegraph.com/api/${THE_GRAPH_API_KEY}/deployments/id/QmYzeik2P18AFNKPtCrEFwuCHws66tjvZpX57KPfKbtnWw`;
// export const SUBGRAPH_VERSION_LLAMA = "2.4";
export const SUBGRAPH_ENDPOINT_LLAMA = `https://gateway-arbitrum.network.thegraph.com/api/${THE_GRAPH_API_KEY}/deployments/id/QmU6W7w6gAjDoE637hAVLjizp2cc7RYtUQsEzKnGp26VVa`;
export const SUBGRAPH_ENDPOINT_LLAMA_FALLBACK = `https://api.thegraph.com/subgraphs/id/QmU6W7w6gAjDoE637hAVLjizp2cc7RYtUQsEzKnGp26VVa`;
export const SUBGRAPH_VERSION_LLAMA = "3.5.1";

export const NETWORK_TO_SUBGRAPH : {[key: string]: string} = {
  "ethereum": SUBGRAPH_ENDPOINT,
  "arbitrum": SUBGRAPH_ENDPOINT_ARBITRUM,
  "optimism": SUBGRAPH_ENDPOINT_OPTIMISM,
}

// Web3
export const ALCHEMY_API_KEY = process.env['ALCHEMY_API_KEY'];
export const ALCHEMY_API_KEY_ARBITRUM = process.env['ALCHEMY_API_KEY_ARBITRUM'];
export const ALCHEMY_API_KEY_OPTIMISM = process.env['ALCHEMY_API_KEY_OPTIMISM'];
export const ALCHEMY_ENDPOINT = `https://eth-mainnet.g.alchemy.com/v2/${process.env['ALCHEMY_API_KEY']}`;
export const START_BLOCK = 15307294;

export const NETWORK_TO_ALCHEMY_ENDPOINT: {[key: string]: string} = {
  "ethereum": `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
  "arbitrum": `https://arb-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY_ARBITRUM}`,
  "optimism": `https://opt-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY_OPTIMISM}`
}

export const SILO_FACTORY_ADDRESS = '0x4D919CEcfD4793c0D47866C8d0a02a0950737589';
export const SILO_REPOSITORY_ADDRESS = "0xd998C35B7900b344bbBe6555cc11576942Cf309d";
export const SILO_LLAMA_FACTORY_ADDRESS = '0x2c0fA05281730EFd3ef71172d8992500B36b56eA';
export const SILO_LLAMA_REPOSITORY_ADDRESS = '0xBCd67f35c7A2F212db0AD7f68fC773b5aC15377c';

export const SILO_FACTORY_ADDRESS_ARBITRUM = '0x4166487056A922D784b073d4d928a516B074b719';
export const SILO_REPOSITORY_ADDRESS_ARBITRUM = "0x8658047e48CC09161f4152c79155Dac1d710Ff0a";

export const SILO_FACTORY_ADDRESS_OPTIMISM = '0x6B14c4450a29Dd9562c20259eBFF67a577b540b9';
export const SILO_REPOSITORY_ADDRESS_OPTIMISM = "0xD2767dAdED5910bbc205811FdbD2eEFd460AcBe9";

export const SILO_CONVEX_FACTORY_ADDRESS = '0x6d4A256695586F61b77B09bc3D28333A91114d5a';

export const SILO_LENS_ADDRESS = '0x0e466FC22386997daC23D1f89A43ecb2CB1e76E9';
export const SILO_LENS_ADDRESS_LLAMA = '0x32a4Bcd8DEa5E18a12a50584682f8E4B77fFF2DF';
export const SILO_LENS_ADDRESS_ARBITRUM = '0x07b94eB6AaD663c4eaf083fBb52928ff9A15BE47';
export const SILO_LENS_ADDRESS_OPTIMISM = '0xd3De080436b9d38DC315944c16d89C050C414Fed';

export const SILO_BLACKLIST = ["0x6543ee07Cf5Dd7Ad17AeECF22ba75860ef3bBAAa"];

export const MAX_TOTAL_BLOCK_RANGE : {[key: string]: number} = {
  "ethereum": 1500000,
  "arbitrum": 3500000,
  "optimism": 3500000,
}

export const MAX_TOTAL_BLOCK_RANGE_SUBGRAPH : {[key: string]: number} = {
  "ethereum": 15000000,
  "arbitrum": 35000000,
  "optimism": 35000000,
}

export const NETWORKS = [
  "ethereum",
  "arbitrum",
  "optimism"
];

export const NETWORK_TO_MAX_BLOCK_BATCH_SIZE : {[key: string]: number} = {
  "ethereum": 150000,
  "arbitrum": 300000,
  "optimism": 300000,
}

export const NETWORK_ID_TO_COINGECKO_ID : {[key: string]: string} = {
  "ethereum": "ethereum",
  "arbitrum": "arbitrum-one",
  "optimism": "optimistic-ethereum",
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
    subgraphEndpointFallback: SUBGRAPH_ENDPOINT_FALLBACK,
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
    siloRepository: {
      address: SILO_REPOSITORY_ADDRESS,
      abi: SiloRepositoryABI,
      meta: 'ethereum-original-and-convex'
    },
  },
  {
    id: 'ethereum-llama',
    idHumanReadable: "Ethereum LLAMA",
    network: "ethereum",
    siloLens: SILO_LENS_ADDRESS_LLAMA,
    siloLensABI: SiloLensLlamaABI,
    siloBlacklist: SILO_BLACKLIST,
    subgraphEndpoint: SUBGRAPH_ENDPOINT_LLAMA,
    subgraphEndpointFallback: SUBGRAPH_ENDPOINT_LLAMA_FALLBACK,
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
    id: 'arbitrum-original',
    idHumanReadable: "Arbitrum Original",
    network: "arbitrum",
    siloLens: SILO_LENS_ADDRESS_ARBITRUM,
    siloLensABI: SiloLensABI,
    siloBlacklist: SILO_BLACKLIST,
    subgraphEndpoint: SUBGRAPH_ENDPOINT_ARBITRUM,
    subgraphEndpointFallback: SUBGRAPH_ENDPOINT_ARBITRUM_FALLBACK,
    siloFactories: [{
      address: SILO_FACTORY_ADDRESS_ARBITRUM,
      abi: SiloFactoryABI,
      meta: "arbitrum-original",
    }],
    incentiveControllers: [{
      address: "0xd592F705bDC8C1B439Bd4D665Ed99C4FaAd5A680",
      assetAddress: "0x912CE59144191C1204E64559FE8253a0e49E6548",
    }],
    siloRepository: {
      address: SILO_REPOSITORY_ADDRESS_ARBITRUM,
      abi: SiloRepositoryABI,
      meta: 'arbitrum-repository'
    },
  },
  {
    id: 'optimism-original',
    idHumanReadable: "Optimism Original",
    network: "optimism",
    siloLens: SILO_LENS_ADDRESS_OPTIMISM,
    siloLensABI: SiloLensABI,
    siloBlacklist: SILO_BLACKLIST,
    subgraphEndpoint: SUBGRAPH_ENDPOINT_OPTIMISM,
    subgraphEndpointFallback: SUBGRAPH_ENDPOINT_OPTIMISM_FALLBACK,
    siloFactories: [{
      address: SILO_FACTORY_ADDRESS_OPTIMISM,
      abi: SiloFactoryABI,
      meta: "optimism-original",
    }],
    siloRepository: {
      address: SILO_REPOSITORY_ADDRESS_OPTIMISM,
      abi: SiloRepositoryABI,
      meta: 'optimism-repository'
    },
  }
]

// TODO: Add support for proxies between chains, will require update to fetchCoingeckoPrices

export const PRICE_PROXIES : {[key: string]: {[key: string]: {proxyAddress: string}}} = {
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
}