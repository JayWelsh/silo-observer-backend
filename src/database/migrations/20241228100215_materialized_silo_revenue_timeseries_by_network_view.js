const {
  HOURLY_SILO_REVENUE_SNAPSHOT_TIMESERIES_BY_NETWORK_MATERIALIZED_VIEW,
  SILO_REVENUE_SNAPSHOT_TABLE,
} = require("../tables");

exports.up = (knex) => knex.schema.raw(`
  CREATE MATERIALIZED VIEW ${HOURLY_SILO_REVENUE_SNAPSHOT_TIMESERIES_BY_NETWORK_MATERIALIZED_VIEW} AS
WITH RECURSIVE 
time_series AS (
  SELECT 
    date_trunc('hour', MIN(timestamp)) as hour_timestamp,
    date_trunc('hour', MAX(timestamp)) as max_timestamp
  FROM ${SILO_REVENUE_SNAPSHOT_TABLE}
  UNION ALL
  SELECT 
    hour_timestamp + interval '1 hour',
    max_timestamp
  FROM time_series
  WHERE hour_timestamp < max_timestamp
),
networks AS (
  SELECT DISTINCT network 
  FROM ${SILO_REVENUE_SNAPSHOT_TABLE}
),
time_network_series AS (
  SELECT 
    ts.hour_timestamp,
    n.network
  FROM time_series ts
  CROSS JOIN networks n
),
latest_snapshots AS (
  SELECT 
    tns.hour_timestamp,
    tns.network,
    COALESCE(
      (
        WITH latest_sync AS (
          SELECT MAX(timestamp) as max_ts
          FROM ${SILO_REVENUE_SNAPSHOT_TABLE}
          WHERE network = tns.network
          AND timestamp < tns.hour_timestamp + interval '1 hour'
          AND timestamp >= tns.hour_timestamp
        )
        SELECT SUM(amount_pending_usd)
        FROM ${SILO_REVENUE_SNAPSHOT_TABLE}, latest_sync
        WHERE network = tns.network
        AND timestamp = latest_sync.max_ts
      ),
      (
        WITH latest_sync AS (
          SELECT MAX(timestamp) as max_ts
          FROM ${SILO_REVENUE_SNAPSHOT_TABLE}
          WHERE network = tns.network
          AND timestamp < tns.hour_timestamp
        )
        SELECT SUM(amount_pending_usd)
        FROM ${SILO_REVENUE_SNAPSHOT_TABLE}, latest_sync
        WHERE network = tns.network
        AND timestamp = latest_sync.max_ts
      ),
      0
    ) as amount_pending_usd,
    COALESCE(
      (
        WITH latest_sync AS (
          SELECT MAX(timestamp) as max_ts
          FROM ${SILO_REVENUE_SNAPSHOT_TABLE}
          WHERE network = tns.network
          AND timestamp < tns.hour_timestamp + interval '1 hour'
          AND timestamp >= tns.hour_timestamp
        )
        SELECT SUM(amount_harvested_usd)
        FROM ${SILO_REVENUE_SNAPSHOT_TABLE}, latest_sync
        WHERE network = tns.network
        AND timestamp = latest_sync.max_ts
      ),
      (
        WITH latest_sync AS (
          SELECT MAX(timestamp) as max_ts
          FROM ${SILO_REVENUE_SNAPSHOT_TABLE}
          WHERE network = tns.network
          AND timestamp < tns.hour_timestamp
        )
        SELECT SUM(amount_harvested_usd)
        FROM ${SILO_REVENUE_SNAPSHOT_TABLE}, latest_sync
        WHERE network = tns.network
        AND timestamp = latest_sync.max_ts
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
FROM latest_snapshots
WHERE amount_pending_usd != 0
   OR amount_harvested_usd != 0
ORDER BY hour_timestamp DESC, network;

CREATE UNIQUE INDEX hourly_snapshots_composite_idx 
  ON ${HOURLY_SILO_REVENUE_SNAPSHOT_TIMESERIES_BY_NETWORK_MATERIALIZED_VIEW} (hour_timestamp DESC, network);
CREATE INDEX hourly_snapshots_network_idx 
  ON ${HOURLY_SILO_REVENUE_SNAPSHOT_TIMESERIES_BY_NETWORK_MATERIALIZED_VIEW} (network);
CREATE INDEX hourly_snapshots_timestamp_idx 
  ON ${HOURLY_SILO_REVENUE_SNAPSHOT_TIMESERIES_BY_NETWORK_MATERIALIZED_VIEW} (hour_timestamp DESC);
`);

exports.down = (knex) => knex.schema.raw(`
  DROP MATERIALIZED VIEW IF EXISTS ${HOURLY_SILO_REVENUE_SNAPSHOT_TIMESERIES_BY_NETWORK_MATERIALIZED_VIEW} CASCADE
`);