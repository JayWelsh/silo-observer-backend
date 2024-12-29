const {
  BORROWED_TIMESERIES_MATERIALIZED_VIEW,
  BORROWED_MINUTELY_TABLE,
  BORROWED_HOURLY_TABLE,
} = require("../tables");

exports.up = (knex) => knex.schema.raw(`
  DROP MATERIALIZED VIEW IF EXISTS ${BORROWED_TIMESERIES_MATERIALIZED_VIEW} CASCADE;
  CREATE MATERIALIZED VIEW ${BORROWED_TIMESERIES_MATERIALIZED_VIEW} AS
WITH base_data AS (
  SELECT DISTINCT network, deployment_id
  FROM ${BORROWED_HOURLY_TABLE}
  WHERE meta = 'all'
),
twenty_min_series AS (
  -- Generate 20-minute intervals for last 24 hours
  SELECT 
    gs as interval_start,
    bd.network,
    bd.deployment_id
  FROM generate_series(
    date_trunc('hour', CURRENT_TIMESTAMP - interval '24 hours'),
    CURRENT_TIMESTAMP,
    interval '20 minutes'
  ) gs
  CROSS JOIN base_data bd
),
latest_24h_data AS (
  -- Get data points at 20-min intervals for last 24 hours
  SELECT DISTINCT ON (tms.interval_start, tms.network, tms.deployment_id)
    tms.interval_start as timestamp,
    tms.network,
    tms.deployment_id,
    FIRST_VALUE(m.borrowed) OVER w as borrowed,
    FIRST_VALUE(m.meta) OVER w as meta
  FROM twenty_min_series tms
  LEFT JOIN ${BORROWED_MINUTELY_TABLE} m ON
    m.timestamp <= tms.interval_start
    AND m.network = tms.network
    AND m.deployment_id = tms.deployment_id
    AND m.meta = 'all'
  WINDOW w AS (
    PARTITION BY tms.interval_start, tms.network, tms.deployment_id
    ORDER BY m.timestamp DESC
    ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
  )
),
time_series AS (
  -- 24 hours to 7 days: HOURLY resolution
  SELECT DISTINCT
    generate_series as ts
  FROM (
    SELECT
      generate_series(
        date_trunc('hour', CURRENT_TIMESTAMP - interval '7 days'),
        date_trunc('hour', CURRENT_TIMESTAMP - interval '24 hours' - interval '1 hour'),
        interval '1 hour'
      )
  ) hourly
  
  UNION
  
  -- 7-30 days ago: 4-HOUR resolution
  SELECT DISTINCT
    generate_series
  FROM (
    SELECT
      generate_series(
        date_trunc('hour', CURRENT_TIMESTAMP - interval '30 days'),
        date_trunc('hour', CURRENT_TIMESTAMP - interval '7 days' - interval '1 hour'),
        interval '4 hours'
      )
  ) four_hourly
  
  UNION
  
  -- 30-90 days ago: 12-HOUR resolution
  SELECT DISTINCT
    generate_series
  FROM (
    SELECT
      generate_series(
        date_trunc('hour', CURRENT_TIMESTAMP - interval '90 days'),
        date_trunc('hour', CURRENT_TIMESTAMP - interval '30 days' - interval '1 hour'),
        interval '12 hours'
      )
  ) twelve_hourly
  
  UNION
  
  -- 90 days-5 years ago: DAILY resolution at midnight
  SELECT DISTINCT
    generate_series
  FROM (
    SELECT
      generate_series(
        date_trunc('day', CURRENT_TIMESTAMP - interval '5 years'),
        date_trunc('day', CURRENT_TIMESTAMP - interval '90 days' - interval '1 day'),
        interval '1 day'
      )
  ) daily
  
  UNION
  
  -- Before 5 years ago: WEEKLY resolution starting midnight Monday
  SELECT DISTINCT
    generate_series
  FROM (
    SELECT
      generate_series(
        date_trunc('week', (
          SELECT MIN(timestamp) 
          FROM ${BORROWED_HOURLY_TABLE} 
          WHERE meta = 'all'
        )),
        date_trunc('week', CURRENT_TIMESTAMP - interval '5 years' - interval '1 week'),
        interval '1 week'
      )
  ) weekly
),
full_series AS (
  SELECT DISTINCT 
    ts as timestamp,
    bd.network,
    bd.deployment_id
  FROM time_series
  CROSS JOIN base_data bd
),
historical_data AS (
  SELECT DISTINCT ON (fs.timestamp, fs.network, fs.deployment_id)
    fs.timestamp,
    fs.network,
    fs.deployment_id,
    FIRST_VALUE(borrowed) OVER w as borrowed,
    FIRST_VALUE(meta) OVER w as meta
  FROM full_series fs
  LEFT JOIN ${BORROWED_HOURLY_TABLE} h ON
    h.timestamp <= fs.timestamp
    AND h.network = fs.network
    AND h.deployment_id = fs.deployment_id
    AND h.meta = 'all'
  WINDOW w AS (
    PARTITION BY fs.network, fs.deployment_id, fs.timestamp
    ORDER BY h.timestamp DESC
    ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
  )
),
combined_data AS (
  SELECT * FROM latest_24h_data
  
  UNION ALL
  
  SELECT * FROM historical_data
  WHERE timestamp < (
    SELECT COALESCE(MIN(timestamp), '-infinity'::timestamp)
    FROM latest_24h_data
  )
)
SELECT *
FROM combined_data
WHERE borrowed != 0
  AND borrowed IS NOT NULL
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