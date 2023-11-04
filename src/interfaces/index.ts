// Subgraph Interfaces Below

export interface ITokenSubgraph {
  symbol: string
  id: string
  decimals: number
  lastPriceUSD?: string
}

export interface IRateEntrySubgraph {
  rate: number
  side: string
  type: "BORROWER" | "LENDER"
  token: ITokenSubgraph
}

export interface IMarket {
  id: string,
  inputToken: ITokenSubgraph,
  outputToken: ITokenSubgraph[]
}

// Subgraph Interfaces Above

// -------------------------

// Internal Interfaces Below

export interface ITransformer {
  transform: (arg0: any) => any;
  constructor: any;
}

export interface IToken {
  address: string
  symbol: string
  decimals: number
}

export interface ISilo {
  name: string
  address: string
  network: string
  deployment_id: string
  input_token_address: string
  tvl: number
  borrowed: number
  latest_rates: IRate[]
}

export interface IAsset {
  address: string
  symbol: string
  decimals: number
}

export interface IRate {
  id: number
  rate: number
  side: string
  timestamp: string
  silo_address: string
  asset_address: string
  type: string
  silo?: ISilo
  asset?: IAsset
  network: string
  deployment_id: string
}

export interface IBorrowedTotal {
  id: number
  borrowed: number
  timestamp: string
  silo_address: string
  asset_address: string
  meta: string
  silo?: ISilo
  asset?: IAsset
  network: string
  deployment_id: string
}

export interface ITvlTotal {
  id: number
  tvl: number
  timestamp: string
  silo_address: string
  asset_address: string
  meta: string
  silo?: ISilo
  asset?: IAsset
  network: string
  deployment_id: string
}

export interface ISiloUserEvent {
  silo_address: string
  asset_address: string
  user_address: string
  receiver_address?: string
  amount: number,
  collateral_only?: boolean
  tx_hash: string
  block_number: number
  silo?: ISilo
  asset?: IAsset
  block_metadata?: IBlockMetadata
  block_day_timestamp?: string
}

export interface IBlockMetadata {
  block_number: number,
  block_timestamp_unix: number,
  block_timestamp: string,
  block_day_timestamp: string,
}

// Internal Interfaces Above

export interface IFactoryConfig {
  address: string;
  abi: any;
  meta: string;
}

export interface IDeployment {
  id: string;
  idHumanReadable: string;
  network: string
  siloLens: string;
  siloLensABI: any;
  siloBlacklist: string[];
  subgraphEndpoint: string;
  siloFactories: IFactoryConfig[];
}

export interface IVolumeTimeseriesEntry {
  usd: string;
  block_day_timestamp: string
}