const {
  TVL_TIMESERIES_MATERIALIZED_VIEW,
  TVL_MINUTELY_TABLE,
  TVL_HOURLY_TABLE,
} = require("../tables");

exports.up = (knex) => knex.schema.raw(`
  DROP MATERIALIZED VIEW IF EXISTS ${TVL_TIMESERIES_MATERIALIZED_VIEW} CASCADE;
  CREATE MATERIALIZED VIEW ${TVL_TIMESERIES_MATERIALIZED_VIEW} AS
WITH RECURSIVE 
time_series AS (
  SELECT 
    LEAST(
      date_trunc('hour', MIN(m.timestamp)),
      date_trunc('hour', MIN(h.timestamp))
    ) as hour_timestamp,
    GREATEST(
      date_trunc('hour', MAX(m.timestamp)),
      date_trunc('hour', MAX(h.timestamp))
    ) as max_timestamp
  FROM ${TVL_MINUTELY_TABLE} m
  CROSS JOIN ${TVL_HOURLY_TABLE} h
  WHERE m.meta = 'all' AND h.meta = 'all'
  UNION ALL
  SELECT 
    CASE 
      WHEN hour_timestamp >= CURRENT_TIMESTAMP - interval '7 days'
      THEN hour_timestamp + interval '1 hour'
      WHEN hour_timestamp >= CURRENT_TIMESTAMP - interval '30 days'
      THEN hour_timestamp + interval '4 hours'
      WHEN hour_timestamp >= CURRENT_TIMESTAMP - interval '90 days'
      THEN hour_timestamp + interval '12 hours'
      WHEN hour_timestamp >= CURRENT_TIMESTAMP - interval '1 year'
      THEN hour_timestamp + interval '1 day'
      ELSE hour_timestamp + interval '1 week'
    END,
    max_timestamp
  FROM time_series
  WHERE hour_timestamp < max_timestamp
),
network_deployments AS (
  SELECT DISTINCT network, deployment_id 
  FROM ${TVL_HOURLY_TABLE}
  WHERE meta = 'all'
),
time_network_deployment_series AS (
  SELECT 
    ts.hour_timestamp,
    nd.network,
    nd.deployment_id
  FROM time_series ts
  CROSS JOIN network_deployments nd
),
last_week_hourly AS (
  SELECT 
    date_trunc('hour', timestamp) as hour_timestamp,
    network,
    deployment_id,
    tvl,
    meta
  FROM ${TVL_HOURLY_TABLE}
  WHERE timestamp >= CURRENT_TIMESTAMP - interval '7 days'
    AND meta = 'all'
),
last_month_4h AS (
  SELECT DISTINCT ON (date_trunc('hour', timestamp - interval '4 hours'), network, deployment_id)
    date_trunc('hour', timestamp) as hour_timestamp,
    network,
    deployment_id,
    tvl,
    meta
  FROM ${TVL_HOURLY_TABLE}
  WHERE timestamp >= CURRENT_TIMESTAMP - interval '30 days'
    AND timestamp < CURRENT_TIMESTAMP - interval '7 days'
    AND meta = 'all'
  ORDER BY date_trunc('hour', timestamp - interval '4 hours'), network, deployment_id, timestamp DESC
),
last_quarter_12h AS (
  SELECT DISTINCT ON (date_trunc('hour', timestamp - interval '12 hours'), network, deployment_id)
    date_trunc('hour', timestamp) as hour_timestamp,
    network,
    deployment_id,
    tvl,
    meta
  FROM ${TVL_HOURLY_TABLE}
  WHERE timestamp >= CURRENT_TIMESTAMP - interval '90 days'
    AND timestamp < CURRENT_TIMESTAMP - interval '30 days'
    AND meta = 'all'
  ORDER BY date_trunc('hour', timestamp - interval '12 hours'), network, deployment_id, timestamp DESC
),
last_year_daily AS (
  SELECT DISTINCT ON (date_trunc('day', timestamp), network, deployment_id)
    date_trunc('day', timestamp) as hour_timestamp,
    network,
    deployment_id,
    tvl,
    meta
  FROM ${TVL_HOURLY_TABLE}
  WHERE timestamp >= CURRENT_TIMESTAMP - interval '1 year'
    AND timestamp < CURRENT_TIMESTAMP - interval '90 days'
    AND meta = 'all'
  ORDER BY date_trunc('day', timestamp), network, deployment_id, timestamp DESC
),
historical_weekly AS (
  SELECT DISTINCT ON (date_trunc('week', timestamp), network, deployment_id)
    date_trunc('week', timestamp) as hour_timestamp,
    network,
    deployment_id,
    tvl,
    meta
  FROM ${TVL_HOURLY_TABLE}
  WHERE timestamp < CURRENT_TIMESTAMP - interval '1 year'
    AND meta = 'all'
  ORDER BY date_trunc('week', timestamp), network, deployment_id, timestamp DESC
),
combined_data AS (
  SELECT hour_timestamp as timestamp, network, deployment_id, tvl, meta
  FROM last_week_hourly
  UNION ALL
  SELECT hour_timestamp, network, deployment_id, tvl, meta
  FROM last_month_4h
  UNION ALL
  SELECT hour_timestamp, network, deployment_id, tvl, meta
  FROM last_quarter_12h
  UNION ALL
  SELECT hour_timestamp, network, deployment_id, tvl, meta
  FROM last_year_daily
  UNION ALL
  SELECT hour_timestamp, network, deployment_id, tvl, meta
  FROM historical_weekly
),
latest_records AS (
  SELECT DISTINCT ON (tnds.hour_timestamp, tnds.network, tnds.deployment_id)
    tnds.hour_timestamp,
    tnds.network,
    tnds.deployment_id,
    cd.tvl,
    cd.meta
  FROM time_network_deployment_series tnds
  LEFT JOIN combined_data cd ON cd.network = tnds.network 
    AND cd.deployment_id = tnds.deployment_id
    AND cd.timestamp <= tnds.hour_timestamp
  ORDER BY tnds.hour_timestamp, tnds.network, tnds.deployment_id, cd.timestamp DESC
)
SELECT 
  hour_timestamp as timestamp,
  network,
  deployment_id,
  COALESCE(tvl, 0) as tvl,
  COALESCE(meta, 'all') as meta
FROM latest_records
WHERE COALESCE(tvl, 0) != 0
ORDER BY timestamp DESC, network, deployment_id;

CREATE UNIQUE INDEX tvl_timeseries_composite_idx 
  ON ${TVL_TIMESERIES_MATERIALIZED_VIEW} (timestamp DESC, network, deployment_id);
CREATE INDEX tvl_timeseries_network_idx 
  ON ${TVL_TIMESERIES_MATERIALIZED_VIEW} (network);
CREATE INDEX tvl_timeseries_timestamp_idx 
  ON ${TVL_TIMESERIES_MATERIALIZED_VIEW} (timestamp DESC);
CREATE INDEX tvl_timeseries_deployment_idx 
  ON ${TVL_TIMESERIES_MATERIALIZED_VIEW} (deployment_id);
`);

exports.down = (knex) => knex.schema.raw(`
  DROP MATERIALIZED VIEW IF EXISTS ${TVL_TIMESERIES_MATERIALIZED_VIEW} CASCADE
`);