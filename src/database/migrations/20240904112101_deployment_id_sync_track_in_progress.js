const { DEPLOYMENT_ID_TO_SYNC_METADATA } = require("../tables");

exports.up = (knex) => knex.schema.createTable(DEPLOYMENT_ID_TO_SYNC_METADATA, table => {
    table.increments();
    table.string("deployment_id").index().notNullable();
    table.string("network").index().notNullable();
    table.string("sync_type").index().notNullable();
    table.boolean("in_progress").defaultTo(false);
    table.integer("last_started_timestamp_unix").nullable();
    table.integer("last_ended_timestamp_unix").nullable();
    table.boolean("ended_by_error").defaultTo(false);
    table.string("error_message")
    table.timestamps(true, true);
});

exports.down = knex => knex.schema.dropTable(DEPLOYMENT_ID_TO_SYNC_METADATA);