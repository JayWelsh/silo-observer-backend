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

export interface ISilo {
  id: string,
  baseAsset: ITokenSubgraph,
  bridgeAsset: ITokenSubgraph[]
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
  protocol_version: number
  silo_config_v2: string
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

export interface IRevenueSnapshot {
  id: number
  amount_pending: string;
  amount_pending_usd: string;
  amount_pending_raw: string;
  amount_harvested: string;
  amount_harvested_usd: string;
  amount_harvested_raw: string;
  asset_price_at_sync_time: string
  timestamp: string
  silo_address: string
  asset_address: string
  silo?: ISilo
  asset?: IAsset
  network: string
  deployment_id: string
  asset_symbol?: string
  silo_name?: string;
  pending_usd_delta?: string;
  harvested_usd_delta?: string;
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
  event_name: string
  usd_value_at_event_time: string
  deployment_id: string
  gas_used?: string
  effective_gas_price?: string
  event_fingerprint?: string
}

export interface ISiloUserEventMaterializedView {
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
  event_name: string
  usd_value_at_event_time: string
  deployment_id: string
  gas_used?: string
  effective_gas_price?: string
  event_fingerprint?: string
  block_hash: string;
  block_timestamp_unix: number,
  block_timestamp: string,
  block_day_timestamp: string,
  network: string,
}

export interface ISubgraphLiquidationRecord {
  id: number;
  record_fingerprint: string;
  block_number: number;
  silo_address: string;
  asset_address: string | null;
  liquidator: string;
  liquidatee: string;
  amount: string;
  amount_usd: string;
  profit_usd: string;
  tx_hash: string;
  timestamp_unix: number;
  network: string;
  deployment_id: string;
  created_at: Date;
  updated_at: Date;
  silo?: ISilo
  asset?: IAsset
  block_metadata?: IBlockMetadata
}

export interface IBlockMetadata {
  block_hash: string,
  block_number: number,
  block_timestamp_unix: number,
  block_timestamp: string,
  block_day_timestamp: string,
  network: string,
}

// Internal Interfaces Above

export interface IFactoryConfig {
  deploymentBlock?: number;
  address: string;
  abi: any;
  meta: string;
}

export interface IRepositoryConfig {
  address: string;
  abi: any;
  meta: string;
}

export interface IIncentiveControllerConfig {
  address: string;
  assetAddress: string;
  meta: string;
}

export type IDeployment = IDeploymentV1 | IDeploymentV2;

export interface IDeploymentV1 {
  protocolVersion: 1;
  id: string;
  idHumanReadable: string;
  network: string
  siloLens: string;
  siloLensABI: any;
  siloBlacklist: string[];
  subgraphEndpoint: string;
  subgraphEndpointFallback: string;
  subgraphEndpointTurtle: string;
  siloFactories: IFactoryConfig[];
  siloRepository: IRepositoryConfig;
  incentiveControllers?:  IIncentiveControllerConfig[];
}

export interface IDeploymentV2 {
  protocolVersion: 2;
  id: string;
  idHumanReadable: string;
  network: string
  siloLens: string;
  siloLensABI: any;
  siloBlacklist: string[];
  // subgraphEndpoint: string;
  // subgraphEndpointFallback: string;
  siloFactories: IFactoryConfig[];
  incentiveControllers?:  IIncentiveControllerConfig[];
}

export interface IVolumeTimeseriesQueryResult {
  results: IVolumeTimeseriesEntry[],
  total: number,
  network?: string, // Add this for network grouping
}

export interface IVolumeTimeseriesEntry {
  usd: string;
  block_day_timestamp: string
  network?: string,
}

export type MerklAssetReward = {
  asset_address: string;
  amount: string;
  decimals: string;
  symbol: string;
};

export type MerklUserRewards = Record<string, MerklAssetReward[]>;