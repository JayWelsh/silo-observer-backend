const SILO_TABLE = 'silo';
const ASSET_TABLE = 'asset';

const SILO_USER_TABLE = 'silo_user_table';

const RATE_TABLE = 'rate'; // minutely
const RATE_HOURLY_TABLE = 'rate_hourly';
const RATE_LATEST_TABLE = 'rate_latest';

const TVL_MINUTELY_TABLE = 'tvl_minutely';
const TVL_HOURLY_TABLE = 'tvl_hourly';
const TVL_LATEST_TABLE = 'tvl_latest';
const TVL_TIMESERIES_FILLED = 'tvl_timeseries_filled';

const BORROWED_MINUTELY_TABLE = 'borrowed_minutely';
const BORROWED_HOURLY_TABLE = 'borrowed_hourly';
const BORROWED_LATEST_TABLE = 'borrowed_latest';
const BORROWED_TIMESERIES_FILLED = 'borrowed_timeseries_filled';

const EVENT_INDEXER_BLOCK_TRACKER_TABLE = 'event_indexer_block_tracker';
const BORROW_EVENT_TABLE = 'borrow_event';
const REPAY_EVENT_TABLE = 'repay_event';
const DEPOSIT_EVENT_TABLE = 'deposit_event';
const WITHDRAW_EVENT_TABLE = 'withdraw_event';
const REWARD_EVENT_TABLE = 'reward_event';
const NEW_SILO_EVENT_TABLE = 'new_silo_event';

const BLOCK_METADATA_TABLE = 'block_metadata';

const SUBGRAPH_INDEXER_BLOCK_TRACKER_TABLE = 'subgraph_indexer_block_tracker';
const SUBGRAPH_LIQUIDATION_RECORD_TABLE = 'subgraph_liquidation_record';

const MERKL_REWARD_ENTRY_TABLE = 'merkl_reward_entry';

const DEPLOYMENT_ID_TO_SYNC_METADATA = 'deployment_id_to_sync_metadata';

const UNIFIED_EVENTS_MATERIALIZED_VIEW = 'unified_events_materialized';
const LATEST_SILO_REVENUE_SNAPSHOT_MATERIALIZED_VIEW = 'latest_silo_revenue_snapshot_materialized';
const HOURLY_SILO_REVENUE_SNAPSHOT_TIMESERIES_BY_NETWORK_MATERIALIZED_VIEW = 'hourly_silo_revenue_snapshot_timeseries_by_network_mv';
const HOURLY_SILO_REVENUE_SNAPSHOT_TIMESERIES_BY_NETWORK_EXCL_XAI_MATERIALIZED_VIEW = 'hourly_silo_revenue_snapshot_timeseries_by_network_excl_xai_mv';
const DAILY_SILO_REVENUE_DELTA_BY_NETWORK_MATERIALIZED_VIEW = 'daily_silo_revenue_delta_by_network_mv';
const TVL_TIMESERIES_MATERIALIZED_VIEW = 'tvl_timeseries_mv';
const BORROWED_TIMESERIES_MATERIALIZED_VIEW = 'borrowed_timeseries_mv';
const TVL_TIMESERIES_WITH_GAPS_MATERIALIZED_VIEW = 'tvl_timeseries_with_gaps_mv';
const BORROWED_TIMESERIES_WITH_GAPS_MATERIALIZED_VIEW = 'borrowed_timeseries_with_gaps_mv';

const SILO_REVENUE_SNAPSHOT_TABLE = 'silo_revenue_snapshot';

export {
  SILO_TABLE,
  ASSET_TABLE,
  SILO_USER_TABLE,
  RATE_TABLE, // minutely, todo refactor/table rename
  RATE_HOURLY_TABLE,
  RATE_LATEST_TABLE,
  TVL_MINUTELY_TABLE,
  TVL_HOURLY_TABLE,
  TVL_LATEST_TABLE,
  TVL_TIMESERIES_FILLED,
  BORROWED_MINUTELY_TABLE,
  BORROWED_HOURLY_TABLE,
  BORROWED_LATEST_TABLE,
  BORROWED_TIMESERIES_FILLED,
  EVENT_INDEXER_BLOCK_TRACKER_TABLE,
  BORROW_EVENT_TABLE,
  REPAY_EVENT_TABLE,
  DEPOSIT_EVENT_TABLE,
  WITHDRAW_EVENT_TABLE,
  REWARD_EVENT_TABLE,
  NEW_SILO_EVENT_TABLE,
  BLOCK_METADATA_TABLE,
  SUBGRAPH_INDEXER_BLOCK_TRACKER_TABLE,
  SUBGRAPH_LIQUIDATION_RECORD_TABLE,
  MERKL_REWARD_ENTRY_TABLE,
  DEPLOYMENT_ID_TO_SYNC_METADATA,
  UNIFIED_EVENTS_MATERIALIZED_VIEW,
  SILO_REVENUE_SNAPSHOT_TABLE,
  LATEST_SILO_REVENUE_SNAPSHOT_MATERIALIZED_VIEW,
  HOURLY_SILO_REVENUE_SNAPSHOT_TIMESERIES_BY_NETWORK_MATERIALIZED_VIEW,
  HOURLY_SILO_REVENUE_SNAPSHOT_TIMESERIES_BY_NETWORK_EXCL_XAI_MATERIALIZED_VIEW,
  DAILY_SILO_REVENUE_DELTA_BY_NETWORK_MATERIALIZED_VIEW,
  TVL_TIMESERIES_MATERIALIZED_VIEW,
  BORROWED_TIMESERIES_MATERIALIZED_VIEW,
  TVL_TIMESERIES_WITH_GAPS_MATERIALIZED_VIEW,
  BORROWED_TIMESERIES_WITH_GAPS_MATERIALIZED_VIEW,
}