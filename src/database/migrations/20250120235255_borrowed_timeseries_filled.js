const { BORROWED_TIMESERIES_FILLED } = require("../tables");

exports.up = (knex) => knex.schema.createTable(BORROWED_TIMESERIES_FILLED, table => {
    table.increments();
    
    // Core data fields
    table.timestamp("timestamp").notNullable();
    table.string("network").notNullable();
    table.string("deployment_id").notNullable();
    table.string("protocol_version").notNullable();
    table.decimal("borrowed", 65, 30).notNullable();
    
    // Metadata
    table.timestamp("last_updated").notNullable().defaultTo(knex.fn.now());
    table.timestamps(true, true);

    // Indexes
    table.index(["timestamp"]);
    table.index(["deployment_id", "network", "protocol_version"]);
    
    // Composite primary key
    table.unique(["timestamp", "network", "deployment_id", "protocol_version"]);
});

exports.down = knex => knex.schema.dropTable(BORROWED_TIMESERIES_FILLED);