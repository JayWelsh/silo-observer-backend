const {
  BORROWED_TIMESERIES_MATERIALIZED_VIEW,
  BORROWED_MINUTELY_TABLE,
  BORROWED_HOURLY_TABLE,
} = require("../tables");

exports.up = (knex) => knex.schema.raw(`
  DROP MATERIALIZED VIEW IF EXISTS ${BORROWED_TIMESERIES_MATERIALIZED_VIEW} CASCADE;
  CREATE MATERIALIZED VIEW ${BORROWED_TIMESERIES_MATERIALIZED_VIEW} AS
WITH base_data AS (
  -- Latest minutely data for current hour
  (
    SELECT DISTINCT ON (network, deployment_id)
      date_trunc('hour', timestamp) as timestamp,
      network,
      deployment_id,
      borrowed,
      meta
    FROM ${BORROWED_MINUTELY_TABLE}
    WHERE timestamp >= date_trunc('hour', CURRENT_TIMESTAMP)
      AND meta = 'all'
    ORDER BY network, deployment_id, timestamp DESC
  )
  UNION ALL
  (
    SELECT 
      date_trunc('hour', timestamp) as timestamp,
      network,
      deployment_id,
      borrowed,
      meta
    FROM ${BORROWED_HOURLY_TABLE}
    WHERE timestamp >= CURRENT_TIMESTAMP - interval '7 days'
      AND timestamp < date_trunc('hour', CURRENT_TIMESTAMP)
      AND meta = 'all'
  )
  UNION ALL
  (
    SELECT DISTINCT ON (date_trunc('hour', timestamp - interval '4 hours'), network, deployment_id)
      date_trunc('hour', timestamp),
      network,
      deployment_id,
      borrowed,
      meta
    FROM ${BORROWED_HOURLY_TABLE}
    WHERE timestamp >= CURRENT_TIMESTAMP - interval '30 days'
      AND timestamp < CURRENT_TIMESTAMP - interval '7 days'
      AND meta = 'all'
    ORDER BY date_trunc('hour', timestamp - interval '4 hours'), network, deployment_id, timestamp DESC
  )
  UNION ALL
  (
    SELECT DISTINCT ON (date_trunc('hour', timestamp - interval '12 hours'), network, deployment_id)
      date_trunc('hour', timestamp),
      network,
      deployment_id,
      borrowed,
      meta
    FROM ${BORROWED_HOURLY_TABLE}
    WHERE timestamp >= CURRENT_TIMESTAMP - interval '90 days'
      AND timestamp < CURRENT_TIMESTAMP - interval '30 days'
      AND meta = 'all'
    ORDER BY date_trunc('hour', timestamp - interval '12 hours'), network, deployment_id, timestamp DESC
  )
  UNION ALL
  (
    SELECT DISTINCT ON (date_trunc('day', timestamp), network, deployment_id)
      date_trunc('day', timestamp),
      network,
      deployment_id,
      borrowed,
      meta
    FROM ${BORROWED_HOURLY_TABLE}
    WHERE timestamp >= CURRENT_TIMESTAMP - interval '1 year'
      AND timestamp < CURRENT_TIMESTAMP - interval '90 days'
      AND meta = 'all'
    ORDER BY date_trunc('day', timestamp), network, deployment_id, timestamp DESC
  )
  UNION ALL
  (
    SELECT DISTINCT ON (date_trunc('week', timestamp), network, deployment_id)
      date_trunc('week', timestamp),
      network,
      deployment_id,
      borrowed,
      meta
    FROM ${BORROWED_HOURLY_TABLE}
    WHERE timestamp < CURRENT_TIMESTAMP - interval '1 year'
      AND meta = 'all'
    ORDER BY date_trunc('week', timestamp), network, deployment_id, timestamp DESC
  )
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
      max_time,
      interval '1 hour'
    ) gs
  WHERE gs >= CURRENT_TIMESTAMP - interval '7 days'
  
  UNION ALL
  
  -- 7-30 days ago: 4-HOUR resolution
  SELECT gs
  FROM time_boundaries,
    LATERAL generate_series(
      GREATEST(min_time, CURRENT_TIMESTAMP - interval '30 days'),
      LEAST(max_time, CURRENT_TIMESTAMP - interval '7 days'),
      interval '4 hours'
    ) gs
  WHERE gs >= CURRENT_TIMESTAMP - interval '30 days'
    AND gs < CURRENT_TIMESTAMP - interval '7 days'
  
  UNION ALL
  
  -- 30-90 days ago: 12-HOUR resolution
  SELECT gs
  FROM time_boundaries,
    LATERAL generate_series(
      GREATEST(min_time, CURRENT_TIMESTAMP - interval '90 days'),
      LEAST(max_time, CURRENT_TIMESTAMP - interval '30 days'),
      interval '12 hours'
    ) gs
  WHERE gs >= CURRENT_TIMESTAMP - interval '90 days'
    AND gs < CURRENT_TIMESTAMP - interval '30 days'
  
  UNION ALL
  
  -- 90 days-1 year ago: DAILY resolution
  SELECT gs
  FROM time_boundaries,
    LATERAL generate_series(
      GREATEST(min_time, CURRENT_TIMESTAMP - interval '1 year'),
      LEAST(max_time, CURRENT_TIMESTAMP - interval '90 days'),
      interval '1 day'
    ) gs
  WHERE gs >= CURRENT_TIMESTAMP - interval '1 year'
    AND gs < CURRENT_TIMESTAMP - interval '90 days'
  
  UNION ALL
  
  -- Before 1 year ago: DAILY resolution
  SELECT gs
  FROM time_boundaries,
    LATERAL generate_series(
      min_time,
      LEAST(max_time, CURRENT_TIMESTAMP - interval '1 year'),
      interval '1 day'
    ) gs
  WHERE gs < CURRENT_TIMESTAMP - interval '1 year'
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
    COALESCE(bd.borrowed, 0) as borrowed,
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
WHERE borrowed != 0
ORDER BY timestamp DESC, network, deployment_id;

CREATE UNIQUE INDEX borrowed_timeseries_composite_idx 
  ON ${BORROWED_TIMESERIES_MATERIALIZED_VIEW} (timestamp DESC, network, deployment_id);
CREATE INDEX borrowed_timeseries_network_idx 
  ON ${BORROWED_TIMESERIES_MATERIALIZED_VIEW} (network);
CREATE INDEX borrowed_timeseries_timestamp_idx 
  ON ${BORROWED_TIMESERIES_MATERIALIZED_VIEW} (timestamp DESC);
CREATE INDEX borrowed_timeseries_deployment_idx 
  ON ${BORROWED_TIMESERIES_MATERIALIZED_VIEW} (deployment_id);
`);

exports.down = (knex) => knex.schema.raw(`
  DROP MATERIALIZED VIEW IF EXISTS ${BORROWED_TIMESERIES_MATERIALIZED_VIEW} CASCADE
`);