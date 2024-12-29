const {
  TVL_TIMESERIES_MATERIALIZED_VIEW,
  TVL_MINUTELY_TABLE,
  TVL_HOURLY_TABLE,
} = require("../tables");

exports.up = (knex) => knex.schema.raw(`
  DROP MATERIALIZED VIEW IF EXISTS ${TVL_TIMESERIES_MATERIALIZED_VIEW} CASCADE;
  CREATE MATERIALIZED VIEW ${TVL_TIMESERIES_MATERIALIZED_VIEW} AS
WITH timestamps AS (
  SELECT generate_series(
    date_trunc('hour', (
      SELECT MIN(timestamp) 
      FROM (
        SELECT timestamp FROM ${TVL_MINUTELY_TABLE} WHERE meta = 'all'
        UNION ALL 
        SELECT timestamp FROM ${TVL_HOURLY_TABLE} WHERE meta = 'all'
      ) t
    )),
    date_trunc('hour', CURRENT_TIMESTAMP),
    interval '1 hour'
  ) as ts
),
recent_data AS (
  SELECT 
    date_trunc('hour', timestamp) as ts,
    network,
    deployment_id,
    tvl::numeric as tvl,
    meta,
    timestamp as original_ts
  FROM ${TVL_MINUTELY_TABLE}
  WHERE timestamp >= CURRENT_TIMESTAMP - interval '7 days'
    AND meta = 'all'
),
historical_data AS (
  SELECT 
    date_trunc('hour', timestamp) as ts,
    network,
    deployment_id,
    tvl::numeric as tvl,
    meta,
    timestamp as original_ts
  FROM ${TVL_HOURLY_TABLE}
  WHERE meta = 'all'
),
combined_data AS (
  SELECT * FROM recent_data
  UNION ALL
  SELECT * FROM historical_data
),
deployments AS (
  SELECT DISTINCT network, deployment_id 
  FROM combined_data
),
all_combinations AS (
  SELECT 
    t.ts,
    d.network,
    d.deployment_id
  FROM timestamps t
  CROSS JOIN deployments d
),
latest_values AS (
  SELECT DISTINCT ON (ac.ts, ac.network, ac.deployment_id)
    ac.ts as timestamp,
    ac.network,
    ac.deployment_id,
    cd.tvl,
    cd.meta
  FROM all_combinations ac
  LEFT JOIN combined_data cd ON cd.network = ac.network 
    AND cd.deployment_id = ac.deployment_id
    AND cd.ts <= ac.ts
  WHERE cd.tvl IS NOT NULL
  ORDER BY 
    ac.ts,
    ac.network,
    ac.deployment_id,
    cd.original_ts DESC
)
SELECT * FROM latest_values
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