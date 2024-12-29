const {
  TVL_TIMESERIES_MATERIALIZED_VIEW,
  TVL_MINUTELY_TABLE,
  TVL_HOURLY_TABLE,
} = require("../tables");

exports.up = (knex) => knex.schema.raw(`
  DROP MATERIALIZED VIEW IF EXISTS ${TVL_TIMESERIES_MATERIALIZED_VIEW} CASCADE;
  CREATE MATERIALIZED VIEW ${TVL_TIMESERIES_MATERIALIZED_VIEW} AS
WITH timestamp_bounds AS (
  SELECT 
    LEAST(
      MIN(m.timestamp),
      MIN(h.timestamp)
    ) as min_timestamp,
    GREATEST(
      MAX(m.timestamp),
      MAX(h.timestamp)
    ) as max_timestamp
  FROM ${TVL_MINUTELY_TABLE} m, ${TVL_HOURLY_TABLE} h
  WHERE m.meta = 'all' AND h.meta = 'all'
),
all_data AS (
  SELECT 
    timestamp,
    network,
    deployment_id,
    tvl::numeric as tvl,
    meta
  FROM ${TVL_MINUTELY_TABLE}
  WHERE timestamp >= CURRENT_TIMESTAMP - interval '7 days'
    AND meta = 'all'
  UNION ALL
  SELECT 
    timestamp,
    network,
    deployment_id,
    tvl::numeric as tvl,
    meta
  FROM ${TVL_HOURLY_TABLE}
  WHERE meta = 'all'
),
time_markers AS (
  SELECT generate_series(
    date_trunc('hour', min_timestamp), 
    date_trunc('hour', max_timestamp), 
    CASE 
      WHEN date_trunc('hour', max_timestamp) >= CURRENT_TIMESTAMP - interval '7 days'
      THEN interval '1 hour'
      WHEN date_trunc('hour', max_timestamp) >= CURRENT_TIMESTAMP - interval '30 days'
      THEN interval '4 hours'
      WHEN date_trunc('hour', max_timestamp) >= CURRENT_TIMESTAMP - interval '90 days'
      THEN interval '12 hours'
      WHEN date_trunc('hour', max_timestamp) >= CURRENT_TIMESTAMP - interval '1 year'
      THEN interval '1 day'
      ELSE interval '1 day'
    END
  ) as hour_timestamp
  FROM timestamp_bounds
),
latest_records AS (
  SELECT DISTINCT ON (tm.hour_timestamp, ad.network, ad.deployment_id)
    tm.hour_timestamp as timestamp,
    ad.network,
    ad.deployment_id,
    ad.tvl,
    ad.meta
  FROM time_markers tm
  CROSS JOIN (
    SELECT DISTINCT network, deployment_id
    FROM all_data
  ) unique_deployments
  LEFT JOIN all_data ad ON ad.network = unique_deployments.network
    AND ad.deployment_id = unique_deployments.deployment_id
    AND ad.timestamp <= tm.hour_timestamp
  WHERE ad.tvl IS NOT NULL
  ORDER BY 
    tm.hour_timestamp,
    ad.network,
    ad.deployment_id,
    ad.timestamp DESC
)
SELECT *
FROM latest_records
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