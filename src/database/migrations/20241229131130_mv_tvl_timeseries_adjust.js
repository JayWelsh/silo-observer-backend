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
      ELSE hour_timestamp + interval '1 day'
    END,
    max_timestamp
  FROM time_series
  WHERE hour_timestamp < max_timestamp
),
deployment_info AS (
  SELECT DISTINCT 
    network,
    deployment_id,
    MIN(timestamp) as first_seen
  FROM (
    SELECT network, deployment_id, timestamp 
    FROM ${TVL_MINUTELY_TABLE}
    WHERE meta = 'all'
    UNION
    SELECT network, deployment_id, timestamp 
    FROM ${TVL_HOURLY_TABLE}
    WHERE meta = 'all'
  ) all_data
  WHERE deployment_id IS NOT NULL
  GROUP BY network, deployment_id
),
time_deployment_series AS (
  SELECT 
    ts.hour_timestamp,
    di.network,
    di.deployment_id,
    di.first_seen
  FROM time_series ts
  CROSS JOIN deployment_info di
),
last_week_hourly AS (
  SELECT 
    date_trunc('hour', timestamp) as hour_timestamp,
    network,
    deployment_id,
    tvl::numeric as tvl,
    meta
  FROM ${TVL_MINUTELY_TABLE}
  WHERE timestamp >= CURRENT_TIMESTAMP - interval '7 days'
    AND meta = 'all'
),
last_month_4h AS (
  SELECT DISTINCT ON (date_trunc('hour', timestamp - interval '4 hours'), network, deployment_id)
    date_trunc('hour', timestamp) as hour_timestamp,
    network,
    deployment_id,
    tvl::numeric as tvl,
    meta
  FROM ${TVL_HOURLY_TABLE}
  WHERE timestamp >= CURRENT_TIMESTAMP - interval '30 days'
    AND timestamp < CURRENT_TIMESTAMP - interval '7 days'
    AND meta = 'all'
  ORDER BY 
    date_trunc('hour', timestamp - interval '4 hours'), 
    network, 
    deployment_id, 
    timestamp DESC
),
last_quarter_12h AS (
  SELECT DISTINCT ON (date_trunc('hour', timestamp - interval '12 hours'), network, deployment_id)
    date_trunc('hour', timestamp) as hour_timestamp,
    network,
    deployment_id,
    tvl::numeric as tvl,
    meta
  FROM ${TVL_HOURLY_TABLE}
  WHERE timestamp >= CURRENT_TIMESTAMP - interval '90 days'
    AND timestamp < CURRENT_TIMESTAMP - interval '30 days'
    AND meta = 'all'
  ORDER BY 
    date_trunc('hour', timestamp - interval '12 hours'), 
    network, 
    deployment_id, 
    timestamp DESC
),
last_year_daily AS (
  SELECT DISTINCT ON (date_trunc('day', timestamp), network, deployment_id)
    date_trunc('day', timestamp) as hour_timestamp,
    network,
    deployment_id,
    tvl::numeric as tvl,
    meta
  FROM ${TVL_HOURLY_TABLE}
  WHERE timestamp >= CURRENT_TIMESTAMP - interval '1 year'
    AND timestamp < CURRENT_TIMESTAMP - interval '90 days'
    AND meta = 'all'
  ORDER BY 
    date_trunc('day', timestamp), 
    network, 
    deployment_id, 
    timestamp DESC
),
historical_daily AS (
  SELECT DISTINCT ON (date_trunc('day', timestamp), network, deployment_id)
    date_trunc('day', timestamp) as hour_timestamp,
    network,
    deployment_id,
    tvl::numeric as tvl,
    meta
  FROM ${TVL_HOURLY_TABLE}
  WHERE timestamp < CURRENT_TIMESTAMP - interval '1 year'
    AND meta = 'all'
  ORDER BY 
    date_trunc('day', timestamp), 
    network, 
    deployment_id, 
    timestamp DESC
),
combined_data AS (
  SELECT hour_timestamp, network, deployment_id, tvl, meta
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
  FROM historical_daily
),
latest_records AS (
  SELECT DISTINCT ON (tds.hour_timestamp, tds.network, tds.deployment_id)
    tds.hour_timestamp,
    tds.network,
    tds.deployment_id,
    CASE 
      WHEN tds.hour_timestamp >= tds.first_seen THEN
        COALESCE(
          (
            SELECT tvl
            FROM combined_data cd
            WHERE cd.network = tds.network
              AND cd.deployment_id = tds.deployment_id
              AND cd.hour_timestamp <= tds.hour_timestamp
            ORDER BY cd.hour_timestamp DESC
            LIMIT 1
          ),
          NULL
        )
      ELSE NULL
    END as tvl,
    'all' as meta
  FROM time_deployment_series tds
  ORDER BY 
    tds.hour_timestamp, 
    tds.network, 
    tds.deployment_id, 
    tvl DESC NULLS LAST
)
SELECT 
  hour_timestamp as timestamp,
  network,
  deployment_id,
  tvl,
  meta
FROM latest_records
WHERE tvl IS NOT NULL
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