const SILO_TABLE = 'silo';
const ASSET_TABLE = 'asset';

const SILO_USER_TABLE = 'silo_user_table';

const RATE_TABLE = 'rate'; // minutely
const RATE_HOURLY_TABLE = 'rate_hourly';
const RATE_LATEST_TABLE = 'rate_latest';

const TVL_MINUTELY_TABLE = 'tvl_minutely';
const TVL_HOURLY_TABLE = 'tvl_hourly';

const BORROWED_MINUTELY_TABLE = 'borrowed_minutely';
const BORROWED_HOURLY_TABLE = 'borrowed_hourly';

const EVENT_INDEXER_BLOCK_TRACKER_TABLE = 'event_indexer_block_tracker';
const BORROW_EVENT_TABLE = 'borrow_event';
const REPAY_EVENT_TABLE = 'repay_event';
const DEPOSIT_EVENT_TABLE = 'deposit_event';
const WITHDRAW_EVENT_TABLE = 'withdraw_event';

const BLOCK_METADATA_TABLE = 'block_metadata';

export {
  SILO_TABLE,
  ASSET_TABLE,
  SILO_USER_TABLE,
  RATE_TABLE, // minutely, todo refactor/table rename
  RATE_HOURLY_TABLE,
  RATE_LATEST_TABLE,
  TVL_MINUTELY_TABLE,
  TVL_HOURLY_TABLE,
  BORROWED_MINUTELY_TABLE,
  BORROWED_HOURLY_TABLE,
  EVENT_INDEXER_BLOCK_TRACKER_TABLE,
  BORROW_EVENT_TABLE,
  REPAY_EVENT_TABLE,
  DEPOSIT_EVENT_TABLE,
  WITHDRAW_EVENT_TABLE,
  BLOCK_METADATA_TABLE,
}