const SILO_TABLE = 'silo';
const ASSET_TABLE = 'asset';

const SILO_USER_TABLE = 'silo_user_table';

const RATE_TABLE = 'rate'; // minutely
const RATE_HOURLY_TABLE = 'rate_hourly';
const RATE_LATEST_TABLE = 'rate_latest';

const TVL_MINUTELY_TABLE = 'tvl_minutely';
const TVL_HOURLY_TABLE = 'tvl_hourly';
const TVL_LATEST_TABLE = 'tvl_latest';

const BORROWED_MINUTELY_TABLE = 'borrowed_minutely';
const BORROWED_HOURLY_TABLE = 'borrowed_hourly';
const BORROWED_LATEST_TABLE = 'borrowed_latest';

const EVENT_INDEXER_BLOCK_TRACKER_TABLE = 'event_indexer_block_tracker';
const BORROW_EVENT_TABLE = 'borrow_event';
const REPAY_EVENT_TABLE = 'repay_event';
const DEPOSIT_EVENT_TABLE = 'deposit_event';
const WITHDRAW_EVENT_TABLE = 'withdraw_event';
const REWARD_EVENT_TABLE = 'reward_event';

const BLOCK_METADATA_TABLE = 'block_metadata';

const SUBGRAPH_INDEXER_BLOCK_TRACKER_TABLE = 'subgraph_indexer_block_tracker';
const SUBGRAPH_LIQUIDATION_RECORD_TABLE = 'subgraph_liquidation_record';

const MERKL_REWARD_ENTRY_TABLE = 'merkl_reward_entry';

const DEPLOYMENT_ID_TO_SYNC_METADATA = 'deployment_id_to_sync_metadata';

const UNIFIED_EVENTS_MATERIALIZED_VIEW = 'unified_events_materialized';
const LATEST_SILO_REVENUE_SNAPSHOT_MATERIALIZED_VIEW = 'latest_silo_revenue_snapshot_materialized';

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
  BORROWED_MINUTELY_TABLE,
  BORROWED_HOURLY_TABLE,
  BORROWED_LATEST_TABLE,
  EVENT_INDEXER_BLOCK_TRACKER_TABLE,
  BORROW_EVENT_TABLE,
  REPAY_EVENT_TABLE,
  DEPOSIT_EVENT_TABLE,
  WITHDRAW_EVENT_TABLE,
  REWARD_EVENT_TABLE,
  BLOCK_METADATA_TABLE,
  SUBGRAPH_INDEXER_BLOCK_TRACKER_TABLE,
  SUBGRAPH_LIQUIDATION_RECORD_TABLE,
  MERKL_REWARD_ENTRY_TABLE,
  DEPLOYMENT_ID_TO_SYNC_METADATA,
  UNIFIED_EVENTS_MATERIALIZED_VIEW,
  SILO_REVENUE_SNAPSHOT_TABLE,
  LATEST_SILO_REVENUE_SNAPSHOT_MATERIALIZED_VIEW,
}