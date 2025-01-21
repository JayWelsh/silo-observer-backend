const {
  BORROWED_TIMESERIES_MATERIALIZED_VIEW,
  BORROWED_TIMESERIES_WITH_GAPS_MATERIALIZED_VIEW,
  BORROWED_MINUTELY_TABLE,
  BORROWED_HOURLY_TABLE,
} = require("../tables");

exports.up = (knex) => knex.schema.raw(`
  DROP MATERIALIZED VIEW IF EXISTS ${BORROWED_TIMESERIES_MATERIALIZED_VIEW} CASCADE;
  DROP MATERIALIZED VIEW IF EXISTS ${BORROWED_TIMESERIES_WITH_GAPS_MATERIALIZED_VIEW} CASCADE;
CREATE MATERIALIZED VIEW ${BORROWED_TIMESERIES_WITH_GAPS_MATERIALIZED_VIEW} AS
WITH combined_data AS (
    SELECT 
        timestamp,
        network,
        deployment_id,
        protocol_version,
        borrowed,
        meta,
        'hourly' as source
    FROM ${BORROWED_HOURLY_TABLE} 
    WHERE meta = 'all'
    
    UNION ALL
    
    SELECT 
        timestamp,
        network,
        deployment_id,
        protocol_version,
        borrowed,
        meta,
        'minutely' as source
    FROM ${BORROWED_MINUTELY_TABLE}
    WHERE meta = 'all'
),
ranked_data AS (
    SELECT 
        timestamp,
        network,
        deployment_id,
        protocol_version,
        borrowed,
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
    borrowed,
    meta
FROM ranked_data
WHERE rn = 1
ORDER BY timestamp;

CREATE INDEX ON ${BORROWED_TIMESERIES_WITH_GAPS_MATERIALIZED_VIEW} (timestamp);
CREATE INDEX ON ${BORROWED_TIMESERIES_WITH_GAPS_MATERIALIZED_VIEW} (deployment_id, network, protocol_version);
CREATE INDEX ON ${BORROWED_TIMESERIES_WITH_GAPS_MATERIALIZED_VIEW} (network);
CREATE INDEX ON ${BORROWED_TIMESERIES_WITH_GAPS_MATERIALIZED_VIEW} (protocol_version);
CREATE UNIQUE INDEX ON ${BORROWED_TIMESERIES_WITH_GAPS_MATERIALIZED_VIEW} (timestamp, network, deployment_id, protocol_version, meta);
`);

exports.down = (knex) => knex.schema.raw(`
  DROP MATERIALIZED VIEW IF EXISTS ${BORROWED_TIMESERIES_WITH_GAPS_MATERIALIZED_VIEW} CASCADE;
`);