const {
  DAILY_SILO_REVENUE_DELTA_BY_NETWORK_MATERIALIZED_VIEW,
  SILO_REVENUE_SNAPSHOT_TABLE,
} = require("../tables");

exports.up = (knex) => knex.schema.raw(`
  DROP MATERIALIZED VIEW IF EXISTS ${DAILY_SILO_REVENUE_DELTA_BY_NETWORK_MATERIALIZED_VIEW} CASCADE;
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
networks_and_protocols AS (
  SELECT DISTINCT network, protocol_version 
  FROM ${SILO_REVENUE_SNAPSHOT_TABLE}
),
time_network_protocol_series AS (
  SELECT 
    ts.hour_timestamp,
    np.network,
    np.protocol_version
  FROM time_series ts
  CROSS JOIN networks_and_protocols np
),
hourly_snapshots AS (
  SELECT 
    tnps.hour_timestamp,
    tnps.network,
    tnps.protocol_version,
    COALESCE(
      (
        WITH latest_sync AS (
          SELECT MAX(timestamp) as max_ts
          FROM ${SILO_REVENUE_SNAPSHOT_TABLE}
          WHERE network = tnps.network
          AND protocol_version = tnps.protocol_version
          AND timestamp < tnps.hour_timestamp + interval '1 hour'
          AND timestamp >= tnps.hour_timestamp
        )
        SELECT SUM(amount_pending_usd)
        FROM ${SILO_REVENUE_SNAPSHOT_TABLE}, latest_sync
        WHERE network = tnps.network
        AND protocol_version = tnps.protocol_version
        AND timestamp = latest_sync.max_ts
      ),
      (
        WITH latest_sync AS (
          SELECT MAX(timestamp) as max_ts
          FROM ${SILO_REVENUE_SNAPSHOT_TABLE}
          WHERE network = tnps.network
          AND protocol_version = tnps.protocol_version
          AND timestamp < tnps.hour_timestamp
          AND timestamp >= date_trunc('day', CURRENT_TIMESTAMP)
        )
        SELECT SUM(amount_pending_usd)
        FROM ${SILO_REVENUE_SNAPSHOT_TABLE}, latest_sync
        WHERE network = tnps.network
        AND protocol_version = tnps.protocol_version
        AND timestamp = latest_sync.max_ts
      ),
      0
    ) as amount_pending_usd,
    COALESCE(
      (
        WITH latest_sync AS (
          SELECT MAX(timestamp) as max_ts
          FROM ${SILO_REVENUE_SNAPSHOT_TABLE}
          WHERE network = tnps.network
          AND protocol_version = tnps.protocol_version
          AND timestamp < tnps.hour_timestamp + interval '1 hour'
          AND timestamp >= tnps.hour_timestamp
        )
        SELECT SUM(amount_harvested_usd)
        FROM ${SILO_REVENUE_SNAPSHOT_TABLE}, latest_sync
        WHERE network = tnps.network
        AND protocol_version = tnps.protocol_version
        AND timestamp = latest_sync.max_ts
      ),
      (
        WITH latest_sync AS (
          SELECT MAX(timestamp) as max_ts
          FROM ${SILO_REVENUE_SNAPSHOT_TABLE}
          WHERE network = tnps.network
          AND protocol_version = tnps.protocol_version
          AND timestamp < tnps.hour_timestamp
          AND timestamp >= date_trunc('day', CURRENT_TIMESTAMP)
        )
        SELECT SUM(amount_harvested_usd)
        FROM ${SILO_REVENUE_SNAPSHOT_TABLE}, latest_sync
        WHERE network = tnps.network
        AND protocol_version = tnps.protocol_version
        AND timestamp = latest_sync.max_ts
      ),
      0
    ) as amount_harvested_usd
  FROM time_network_protocol_series tnps
),
first_and_last_values AS (
  SELECT 
    network,
    protocol_version,
    FIRST_VALUE(amount_pending_usd) OVER (
      PARTITION BY network, protocol_version 
      ORDER BY hour_timestamp ASC
    ) as first_pending_usd,
    FIRST_VALUE(amount_harvested_usd) OVER (
      PARTITION BY network, protocol_version 
      ORDER BY hour_timestamp ASC
    ) as first_harvested_usd,
    FIRST_VALUE(amount_pending_usd) OVER (
      PARTITION BY network, protocol_version 
      ORDER BY hour_timestamp DESC
    ) as last_pending_usd,
    FIRST_VALUE(amount_harvested_usd) OVER (
      PARTITION BY network, protocol_version 
      ORDER BY hour_timestamp DESC
    ) as last_harvested_usd
  FROM hourly_snapshots
  WHERE amount_pending_usd != 0 
     OR amount_harvested_usd != 0
)
SELECT DISTINCT
  network,
  protocol_version,
  last_pending_usd - first_pending_usd as pending_usd_delta,
  last_harvested_usd - first_harvested_usd as harvested_usd_delta,
  first_pending_usd as start_pending_usd,
  first_harvested_usd as start_harvested_usd,
  last_pending_usd as latest_pending_usd,
  last_harvested_usd as latest_harvested_usd
FROM first_and_last_values
ORDER BY network, protocol_version;

CREATE UNIQUE INDEX daily_delta_network_protocol_idx 
  ON ${DAILY_SILO_REVENUE_DELTA_BY_NETWORK_MATERIALIZED_VIEW} (network, protocol_version);
`);

exports.down = (knex) => knex.schema.raw(`
  DROP MATERIALIZED VIEW IF EXISTS ${DAILY_SILO_REVENUE_DELTA_BY_NETWORK_MATERIALIZED_VIEW} CASCADE
`);