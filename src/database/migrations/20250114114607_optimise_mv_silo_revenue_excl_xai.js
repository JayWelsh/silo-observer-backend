const {
  HOURLY_SILO_REVENUE_SNAPSHOT_TIMESERIES_BY_NETWORK_EXCL_XAI_MATERIALIZED_VIEW,
  SILO_REVENUE_SNAPSHOT_TABLE,
  ASSET_TABLE,
} = require("../tables");

exports.up = (knex) => knex.schema.raw(`
  DROP MATERIALIZED VIEW IF EXISTS ${HOURLY_SILO_REVENUE_SNAPSHOT_TIMESERIES_BY_NETWORK_EXCL_XAI_MATERIALIZED_VIEW} CASCADE;
  
  CREATE MATERIALIZED VIEW ${HOURLY_SILO_REVENUE_SNAPSHOT_TIMESERIES_BY_NETWORK_EXCL_XAI_MATERIALIZED_VIEW} AS
WITH RECURSIVE 
time_series AS (
  SELECT 
    date_trunc('hour', MIN(s.timestamp)) as hour_timestamp,
    date_trunc('hour', MAX(s.timestamp)) as max_timestamp
  FROM ${SILO_REVENUE_SNAPSHOT_TABLE} s
  JOIN ${ASSET_TABLE} a ON s.asset_address = a.address
  WHERE a.symbol != 'XAI'
  UNION ALL
  SELECT 
    hour_timestamp + interval '1 hour',
    max_timestamp
  FROM time_series
  WHERE hour_timestamp < max_timestamp
),
time_network_series AS (
  SELECT 
    ts.hour_timestamp,
    n.network
  FROM time_series ts
  CROSS JOIN (
    SELECT DISTINCT s.network 
    FROM ${SILO_REVENUE_SNAPSHOT_TABLE} s
    JOIN ${ASSET_TABLE} a ON s.asset_address = a.address
    WHERE a.symbol != 'XAI'
  ) n
),
snapshot_values AS (
  SELECT 
    date_trunc('hour', s.timestamp) as hour_timestamp,
    s.network,
    SUM(s.amount_pending_usd) as amount_pending_usd,
    SUM(s.amount_harvested_usd) as amount_harvested_usd,
    ROW_NUMBER() OVER (
      PARTITION BY s.network, date_trunc('hour', s.timestamp)
      ORDER BY s.timestamp DESC
    ) as rn
  FROM ${SILO_REVENUE_SNAPSHOT_TABLE} s
  JOIN ${ASSET_TABLE} a ON s.asset_address = a.address
  WHERE a.symbol != 'XAI'
  GROUP BY date_trunc('hour', s.timestamp), s.network, s.timestamp
),
latest_values AS (
  SELECT 
    tns.hour_timestamp,
    tns.network,
    COALESCE(
      (
        SELECT sv.amount_pending_usd
        FROM snapshot_values sv
        WHERE sv.network = tns.network
          AND sv.hour_timestamp <= tns.hour_timestamp
          AND sv.rn = 1
        ORDER BY sv.hour_timestamp DESC
        LIMIT 1
      ),
      0
    ) as amount_pending_usd,
    COALESCE(
      (
        SELECT sv.amount_harvested_usd
        FROM snapshot_values sv
        WHERE sv.network = tns.network
          AND sv.hour_timestamp <= tns.hour_timestamp
          AND sv.rn = 1
        ORDER BY sv.hour_timestamp DESC
        LIMIT 1
      ),
      0
    ) as amount_harvested_usd
  FROM time_network_series tns
)
SELECT 
  hour_timestamp,
  network,
  amount_pending_usd,
  amount_harvested_usd
FROM latest_values
WHERE amount_pending_usd != 0 OR amount_harvested_usd != 0
ORDER BY hour_timestamp DESC, network;

CREATE UNIQUE INDEX hourly_snapshots_composite_idx_excl_xai 
  ON ${HOURLY_SILO_REVENUE_SNAPSHOT_TIMESERIES_BY_NETWORK_EXCL_XAI_MATERIALIZED_VIEW} (hour_timestamp DESC, network);
CREATE INDEX hourly_snapshots_network_idx_excl_xai 
  ON ${HOURLY_SILO_REVENUE_SNAPSHOT_TIMESERIES_BY_NETWORK_EXCL_XAI_MATERIALIZED_VIEW} (network);
CREATE INDEX hourly_snapshots_timestamp_idx_excl_xai 
  ON ${HOURLY_SILO_REVENUE_SNAPSHOT_TIMESERIES_BY_NETWORK_EXCL_XAI_MATERIALIZED_VIEW} (hour_timestamp DESC);
`);

exports.down = (knex) => knex.schema.raw(`
  DROP MATERIALIZED VIEW IF EXISTS ${HOURLY_SILO_REVENUE_SNAPSHOT_TIMESERIES_BY_NETWORK_EXCL_XAI_MATERIALIZED_VIEW} CASCADE
`);