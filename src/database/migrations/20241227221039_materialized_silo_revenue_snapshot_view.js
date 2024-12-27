const {
  SILO_REVENUE_SNAPSHOT_TABLE,
  SILO_TABLE,
  ASSET_TABLE,
  LATEST_SILO_REVENUE_SNAPSHOT_MATERIALIZED_VIEW,
} = require("../tables");

exports.up = (knex) => knex.schema.raw(`
  CREATE MATERIALIZED VIEW ${LATEST_SILO_REVENUE_SNAPSHOT_MATERIALIZED_VIEW} AS
  WITH latest_timestamps AS (
    SELECT 
      asset_address,
      network,
      silo_address,
      MAX(timestamp) as timestamp
    FROM ${SILO_REVENUE_SNAPSHOT_TABLE}
    GROUP BY asset_address, network, silo_address
  )
  SELECT DISTINCT
    srs.asset_address,
    srs.network,
    srs.silo_address,
    srs.amount_pending,
    srs.amount_pending_usd,
    srs.amount_harvested,
    srs.amount_harvested_usd,
    srs.asset_price_at_sync_time,
    srs.timestamp,
    srs.deployment_id,
    a.symbol as asset_symbol,
    s.name as silo_name
  FROM latest_timestamps lt
  JOIN ${SILO_REVENUE_SNAPSHOT_TABLE} srs
    ON srs.asset_address = lt.asset_address
    AND srs.network = lt.network
    AND srs.silo_address = lt.silo_address
    AND srs.timestamp = lt.timestamp
  LEFT JOIN ${ASSET_TABLE} a ON a.address = srs.asset_address
  LEFT JOIN ${SILO_TABLE} s ON s.address = srs.silo_address
  ORDER BY srs.amount_pending_usd DESC;

  -- Modified indexes to include silo_address in the unique constraint
  CREATE UNIQUE INDEX latest_snapshots_composite_idx 
    ON ${LATEST_SILO_REVENUE_SNAPSHOT_MATERIALIZED_VIEW} (asset_address, network, silo_address, timestamp);
  CREATE INDEX latest_snapshots_amount_pending_usd_idx 
    ON ${LATEST_SILO_REVENUE_SNAPSHOT_MATERIALIZED_VIEW} (amount_pending_usd DESC);
  CREATE INDEX latest_snapshots_network_idx 
    ON ${LATEST_SILO_REVENUE_SNAPSHOT_MATERIALIZED_VIEW} (network);
`);

exports.down = (knex) => knex.schema.raw(`
  DROP MATERIALIZED VIEW IF EXISTS ${LATEST_SILO_REVENUE_SNAPSHOT_MATERIALIZED_VIEW} CASCADE
`);