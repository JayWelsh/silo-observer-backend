const {
  EVENT_INDEXER_BLOCK_TRACKER_TABLE,
} = require("../tables");

exports.up = (knex) => knex.schema.alterTable(EVENT_INDEXER_BLOCK_TRACKER_TABLE, table => {
  table.string("network").notNullable().alter();
});

exports.down = (knex) => knex.schema.alterTable(EVENT_INDEXER_BLOCK_TRACKER_TABLE, table => {
  table.string("network").defaultTo("ethereum").notNullable().alter();
});