const {
  TVL_TIMESERIES_MATERIALIZED_VIEW,
  TVL_TIMESERIES_WITH_GAPS_MATERIALIZED_VIEW,
  TVL_MINUTELY_TABLE,
  TVL_HOURLY_TABLE,
} = require("../tables");

exports.up = (knex) => knex.schema.raw(`
  DROP MATERIALIZED VIEW IF EXISTS ${TVL_TIMESERIES_MATERIALIZED_VIEW} CASCADE;
  DROP MATERIALIZED VIEW IF EXISTS ${TVL_TIMESERIES_WITH_GAPS_MATERIALIZED_VIEW} CASCADE;
CREATE MATERIALIZED VIEW ${TVL_TIMESERIES_WITH_GAPS_MATERIALIZED_VIEW} AS
WITH combined_data AS (
    SELECT 
        timestamp,
        network,
        deployment_id,
        protocol_version,
        tvl,
        meta,
        'hourly' as source
    FROM ${TVL_HOURLY_TABLE} 
    WHERE meta = 'all'
    
    UNION ALL
    
    SELECT 
        timestamp,
        network,
        deployment_id,
        protocol_version,
        tvl,
        meta,
        'minutely' as source
    FROM ${TVL_MINUTELY_TABLE}
    WHERE meta = 'all'
),
ranked_data AS (
    SELECT 
        timestamp,
        network,
        deployment_id,
        protocol_version,
        tvl,
        meta,
        ROW_NUMBER() OVER (
            PARTITION BY 
                date_trunc('hour', timestamp),
                network,
                deployment_id,
                protocol_version
            ORDER BY 
                -- Prefer minutely data over hourly when both exist
                source = 'minutely' DESC,
                timestamp DESC
        ) as rn
    FROM combined_data
)
SELECT 
    timestamp,
    network,
    deployment_id,
    protocol_version,
    tvl,
    meta
FROM ranked_data
WHERE rn = 1
ORDER BY timestamp;

CREATE INDEX ON ${TVL_TIMESERIES_WITH_GAPS_MATERIALIZED_VIEW} (timestamp);
CREATE INDEX ON ${TVL_TIMESERIES_WITH_GAPS_MATERIALIZED_VIEW} (deployment_id, network, protocol_version);
CREATE INDEX ON ${TVL_TIMESERIES_WITH_GAPS_MATERIALIZED_VIEW} (network);
CREATE INDEX ON ${TVL_TIMESERIES_WITH_GAPS_MATERIALIZED_VIEW} (protocol_version);
CREATE UNIQUE INDEX ON ${TVL_TIMESERIES_WITH_GAPS_MATERIALIZED_VIEW} (timestamp, network, deployment_id, protocol_version, meta);
`);

exports.down = (knex) => knex.schema.raw(`
  DROP MATERIALIZED VIEW IF EXISTS ${TVL_TIMESERIES_WITH_GAPS_MATERIALIZED_VIEW} CASCADE;
`);