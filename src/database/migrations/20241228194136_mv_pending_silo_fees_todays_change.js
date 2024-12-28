const {
  DAILY_SILO_REVENUE_DELTA_BY_NETWORK_MATERIALIZED_VIEW,
  SILO_REVENUE_SNAPSHOT_TABLE,
} = require("../tables");

exports.up = (knex) => knex.schema.raw(`
  CREATE MATERIALIZED VIEW ${DAILY_SILO_REVENUE_DELTA_BY_NETWORK_MATERIALIZED_VIEW} AS
WITH RECURSIVE 
time_series AS (
  SELECT 
    date_trunc('hour', MIN(timestamp)) as hour_timestamp,
    date_trunc('hour', MAX(timestamp)) as max_timestamp
  FROM ${SILO_REVENUE_SNAPSHOT_TABLE}
  WHERE timestamp >= date_trunc('day', CURRENT_TIMESTAMP)
    AND timestamp < date_trunc('day', CURRENT_TIMESTAMP) + interval '1 day'
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
hourly_snapshots AS (
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
          AND timestamp >= date_trunc('day', CURRENT_TIMESTAMP)
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
          AND timestamp >= date_trunc('day', CURRENT_TIMESTAMP)
        )
        SELECT SUM(amount_harvested_usd)
        FROM ${SILO_REVENUE_SNAPSHOT_TABLE}, latest_sync
        WHERE network = tns.network
        AND timestamp = latest_sync.max_ts
      ),
      0
    ) as amount_harvested_usd
  FROM time_network_series tns
),
first_and_last_values AS (
  SELECT 
    network,
    FIRST_VALUE(amount_pending_usd) OVER (
      PARTITION BY network 
      ORDER BY hour_timestamp ASC
    ) as first_pending_usd,
    FIRST_VALUE(amount_harvested_usd) OVER (
      PARTITION BY network 
      ORDER BY hour_timestamp ASC
    ) as first_harvested_usd,
    FIRST_VALUE(amount_pending_usd) OVER (
      PARTITION BY network 
      ORDER BY hour_timestamp DESC
    ) as last_pending_usd,
    FIRST_VALUE(amount_harvested_usd) OVER (
      PARTITION BY network 
      ORDER BY hour_timestamp DESC
    ) as last_harvested_usd
  FROM hourly_snapshots
  WHERE amount_pending_usd != 0 
     OR amount_harvested_usd != 0
)
SELECT DISTINCT
  network,
  last_pending_usd - first_pending_usd as pending_usd_delta,
  last_harvested_usd - first_harvested_usd as harvested_usd_delta,
  first_pending_usd as start_pending_usd,
  first_harvested_usd as start_harvested_usd,
  last_pending_usd as latest_pending_usd,
  last_harvested_usd as latest_harvested_usd
FROM first_and_last_values
ORDER BY network;

CREATE UNIQUE INDEX daily_delta_network_idx 
  ON ${DAILY_SILO_REVENUE_DELTA_BY_NETWORK_MATERIALIZED_VIEW} (network);
`);

exports.down = (knex) => knex.schema.raw(`
  DROP MATERIALIZED VIEW IF EXISTS ${DAILY_SILO_REVENUE_DELTA_BY_NETWORK_MATERIALIZED_VIEW} CASCADE
`);