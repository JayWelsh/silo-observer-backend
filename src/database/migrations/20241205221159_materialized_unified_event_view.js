const {
  UNIFIED_EVENTS_MATERIALIZED_VIEW,
  BORROW_EVENT_TABLE,
  REPAY_EVENT_TABLE,
  DEPOSIT_EVENT_TABLE,
  WITHDRAW_EVENT_TABLE,
  SUBGRAPH_LIQUIDATION_RECORD_TABLE,
  SILO_TABLE,
  ASSET_TABLE,
  BLOCK_METADATA_TABLE,
} = require("../tables");

exports.up = (knex) => knex.schema.raw(`
  CREATE MATERIALIZED VIEW ${UNIFIED_EVENTS_MATERIALIZED_VIEW} AS
  WITH event_base AS (
      -- Borrow events
      SELECT 
          'borrow' as event_name,
          event_fingerprint,
          deployment_id,
          network,
          silo_address,
          asset_address,
          block_number,
          amount,
          user_address as user_address,
          tx_hash,
          usd_value_at_event_time as usd_value_at_event_time,
          CONCAT('borrow_', network, '_', id) as id
      FROM ${BORROW_EVENT_TABLE}
      
      UNION ALL
      
      -- Deposit events
      SELECT 
          'deposit' as event_name,
          event_fingerprint,
          deployment_id,
          network,
          silo_address,
          asset_address,
          block_number,
          amount,
          user_address as user_address,
          tx_hash,
          usd_value_at_event_time as usd_value_at_event_time,
          CONCAT('deposit_', network, '_', id) as id
      FROM ${DEPOSIT_EVENT_TABLE}
      
      UNION ALL
      
      -- Repay events
      SELECT 
          'repay' as event_name,
          event_fingerprint,
          deployment_id,
          network,
          silo_address,
          asset_address,
          block_number,
          amount,
          user_address as user_address,
          tx_hash,
          usd_value_at_event_time as usd_value_at_event_time,
          CONCAT('repay_', network, '_', id) as id
      FROM ${REPAY_EVENT_TABLE}
      
      UNION ALL
      
      -- Withdraw events
      SELECT 
          'withdraw' as event_name,
          event_fingerprint,
          deployment_id,
          network,
          silo_address,
          asset_address,
          block_number,
          amount,
          user_address as user_address,
          tx_hash,
          usd_value_at_event_time as usd_value_at_event_time,
          CONCAT('withdraw_', network, '_', id) as id
      FROM ${WITHDRAW_EVENT_TABLE}

      UNION ALL
      
      -- Liquidation events
      SELECT 
          'liquidation' as event_name,
          event_fingerprint,
          deployment_id,
          network,
          silo_address,
          asset_address,
          block_number,
          amount,
          liquidator as user_address,
          tx_hash,
          amount_usd as usd_value_at_event_time,
          CONCAT('liquidation_', network, '_', id) as id
      FROM ${SUBGRAPH_LIQUIDATION_RECORD_TABLE}
  )
  SELECT DISTINCT
      e.id,
      e.event_name,
      e.event_fingerprint,
      e.deployment_id,
      e.network,
      e.silo_address,
      s.name as silo_name,
      e.asset_address,
      a.symbol as asset_symbol,
      a.decimals as asset_decimals,
      e.block_number,
      bm.block_hash,
      bm.block_timestamp,
      bm.block_timestamp_unix,
      bm.block_day_timestamp,
      bm.network as block_network,
      e.amount,
      e.user_address,
      e.tx_hash,
      e.usd_value_at_event_time,
      s.input_token_address as silo_input_token_address
  FROM event_base e
  JOIN ${SILO_TABLE} s ON e.deployment_id = s.deployment_id AND e.silo_address = s.address
  JOIN ${ASSET_TABLE} a ON e.asset_address = a.address
  LEFT JOIN ${BLOCK_METADATA_TABLE} bm ON e.block_number = bm.block_number AND e.network = bm.network
  ORDER BY bm.block_timestamp;

  CREATE UNIQUE INDEX unified_events_materialized_id_idx ON ${UNIFIED_EVENTS_MATERIALIZED_VIEW} (id);
  CREATE INDEX unified_events_materialized_block_timestamp_idx ON ${UNIFIED_EVENTS_MATERIALIZED_VIEW} (block_timestamp);
  CREATE INDEX unified_events_materialized_network_idx ON ${UNIFIED_EVENTS_MATERIALIZED_VIEW} (network);
`)

exports.down = (knex) => knex.schema.raw(`DROP MATERIALIZED VIEW IF EXISTS ${UNIFIED_EVENTS_MATERIALIZED_VIEW} CASCADE`);