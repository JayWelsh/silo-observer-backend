const {
  TVL_TIMESERIES_MATERIALIZED_VIEW,
  TVL_MINUTELY_TABLE,
  TVL_HOURLY_TABLE,
} = require("../tables");

exports.up = (knex) => knex.schema.raw(`
  DROP MATERIALIZED VIEW IF EXISTS ${TVL_TIMESERIES_MATERIALIZED_VIEW} CASCADE;
  CREATE MATERIALIZED VIEW ${TVL_TIMESERIES_MATERIALIZED_VIEW} AS
WITH latest_minutely AS (
  SELECT DISTINCT ON (network, deployment_id)
    timestamp,
    network,
    deployment_id,
    tvl,
    meta
  FROM ${TVL_MINUTELY_TABLE}
  WHERE timestamp >= date_trunc('hour', CURRENT_TIMESTAMP)
    AND meta = 'all'
  ORDER BY network, deployment_id, timestamp DESC
),
current_hourly AS (
  SELECT DISTINCT ON (network, deployment_id)
    timestamp,
    network,
    deployment_id,
    tvl,
    meta
  FROM ${TVL_HOURLY_TABLE}
  WHERE timestamp = date_trunc('hour', CURRENT_TIMESTAMP)
    AND meta = 'all'
  ORDER BY network, deployment_id, timestamp DESC
),
historical_data AS (
  -- Hourly data for past 7 days (excluding current hour)
  (
    SELECT 
      date_trunc('hour', timestamp) as timestamp,
      network,
      deployment_id,
      tvl,
      meta
    FROM ${TVL_HOURLY_TABLE}
    WHERE timestamp >= CURRENT_TIMESTAMP - interval '7 days'
      AND timestamp < date_trunc('hour', CURRENT_TIMESTAMP)
      AND meta = 'all'
  )
  UNION ALL
  -- 7-30 days at 4h intervals
  (
    SELECT DISTINCT ON (date_trunc('hour', timestamp - interval '4 hours'), network, deployment_id)
      date_trunc('hour', timestamp),
      network,
      deployment_id,
      tvl,
      meta
    FROM ${TVL_HOURLY_TABLE}
    WHERE timestamp >= CURRENT_TIMESTAMP - interval '30 days'
      AND timestamp < CURRENT_TIMESTAMP - interval '7 days'
      AND meta = 'all'
    ORDER BY date_trunc('hour', timestamp - interval '4 hours'), network, deployment_id, timestamp DESC
  )
  UNION ALL
  -- 30-90 days at 12h intervals
  (
    SELECT DISTINCT ON (date_trunc('hour', timestamp - interval '12 hours'), network, deployment_id)
      date_trunc('hour', timestamp),
      network,
      deployment_id,
      tvl,
      meta
    FROM ${TVL_HOURLY_TABLE}
    WHERE timestamp >= CURRENT_TIMESTAMP - interval '90 days'
      AND timestamp < CURRENT_TIMESTAMP - interval '30 days'
      AND meta = 'all'
    ORDER BY date_trunc('hour', timestamp - interval '12 hours'), network, deployment_id, timestamp DESC
  )
  UNION ALL
  -- 90 days to 5 years daily at midnight
  (
    SELECT DISTINCT ON (date_trunc('day', timestamp), network, deployment_id)
      date_trunc('day', timestamp),
      network,
      deployment_id,
      tvl,
      meta
    FROM ${TVL_HOURLY_TABLE}
    WHERE timestamp >= CURRENT_TIMESTAMP - interval '5 years'
      AND timestamp < CURRENT_TIMESTAMP - interval '90 days'
      AND meta = 'all'
    ORDER BY date_trunc('day', timestamp), network, deployment_id, timestamp DESC
  )
  UNION ALL
  -- Before 5 years weekly at midnight Monday
  (
    SELECT DISTINCT ON (date_trunc('week', timestamp), network, deployment_id)
      date_trunc('week', timestamp),
      network,
      deployment_id,
      tvl,
      meta
    FROM ${TVL_HOURLY_TABLE}
    WHERE timestamp < CURRENT_TIMESTAMP - interval '5 years'
      AND meta = 'all'
    ORDER BY date_trunc('week', timestamp), network, deployment_id, timestamp DESC
  )
),
base_data AS (
  SELECT * FROM latest_minutely
  UNION ALL
  SELECT * FROM current_hourly
  UNION ALL
  SELECT * FROM historical_data
),
time_boundaries AS (
  SELECT
    MIN(timestamp) as min_time,
    MAX(timestamp) as max_time
  FROM base_data
),
active_combinations AS (
  SELECT DISTINCT
    network,
    deployment_id
  FROM base_data
),
time_series AS (
  -- Last 7 days: HOURLY resolution
  SELECT gs
  FROM time_boundaries,
    LATERAL generate_series(
      GREATEST(min_time, CURRENT_TIMESTAMP - interval '7 days'),
      date_trunc('hour', CURRENT_TIMESTAMP),
      interval '1 hour'
    ) gs
  WHERE gs >= CURRENT_TIMESTAMP - interval '7 days'
  
  UNION ALL
  
  -- 7-30 days ago: 4-HOUR resolution
  SELECT gs
  FROM time_boundaries,
    LATERAL generate_series(
      GREATEST(
        min_time, 
        date_trunc('hour', CURRENT_TIMESTAMP - interval '30 days')
      ),
      LEAST(
        max_time,
        date_trunc('hour', CURRENT_TIMESTAMP - interval '7 days')
      ),
      interval '4 hours'
    ) gs
  WHERE gs >= CURRENT_TIMESTAMP - interval '30 days'
    AND gs < CURRENT_TIMESTAMP - interval '7 days'
  
  UNION ALL
  
  -- 30-90 days ago: 12-HOUR resolution
  SELECT gs
  FROM time_boundaries,
    LATERAL generate_series(
      GREATEST(
        min_time, 
        date_trunc('hour', CURRENT_TIMESTAMP - interval '90 days')
      ),
      LEAST(
        max_time,
        date_trunc('hour', CURRENT_TIMESTAMP - interval '30 days')
      ),
      interval '12 hours'
    ) gs
  WHERE gs >= CURRENT_TIMESTAMP - interval '90 days'
    AND gs < CURRENT_TIMESTAMP - interval '30 days'
  
  UNION ALL
  
  -- 90 days-5 years ago: DAILY resolution at midnight
  SELECT gs
  FROM time_boundaries,
    LATERAL generate_series(
      GREATEST(
        min_time, 
        date_trunc('day', CURRENT_TIMESTAMP - interval '5 years')
      ),
      LEAST(
        max_time,
        date_trunc('day', CURRENT_TIMESTAMP - interval '90 days')
      ),
      interval '1 day'
    ) gs
  WHERE gs >= CURRENT_TIMESTAMP - interval '5 years'
    AND gs < CURRENT_TIMESTAMP - interval '90 days'
  
  UNION ALL
  
  -- Before 5 years ago: WEEKLY resolution starting midnight Monday
  SELECT gs
  FROM time_boundaries,
    LATERAL generate_series(
      date_trunc('week', min_time),
      LEAST(
        max_time,
        date_trunc('week', CURRENT_TIMESTAMP - interval '5 years')
      ),
      interval '1 week'
    ) gs
  WHERE gs < CURRENT_TIMESTAMP - interval '5 years'
),
time_slots AS (
  SELECT
    ts.gs as timestamp,
    ac.network,
    ac.deployment_id
  FROM time_series ts
  CROSS JOIN active_combinations ac
),
filled_data AS (
  SELECT DISTINCT ON (ts.timestamp, ts.network, ts.deployment_id)
    ts.timestamp,
    ts.network,
    ts.deployment_id,
    COALESCE(bd.tvl, 0) as tvl,
    COALESCE(bd.meta, 'all') as meta
  FROM time_slots ts
  LEFT JOIN base_data bd ON
    bd.timestamp <= ts.timestamp AND
    bd.network = ts.network AND
    bd.deployment_id = ts.deployment_id
  ORDER BY ts.timestamp, ts.network, ts.deployment_id, bd.timestamp DESC
)
SELECT *
FROM filled_data
WHERE tvl != 0
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