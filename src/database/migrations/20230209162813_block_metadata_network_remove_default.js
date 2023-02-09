const {
  BLOCK_METADATA_TABLE,
} = require("../tables");

exports.up = (knex) => knex.schema.alterTable(BLOCK_METADATA_TABLE, table => {
  table.string("network").notNullable().alter();
});

exports.down = (knex) => knex.schema.alterTable(BLOCK_METADATA_TABLE, table => {
  table.string("network").defaultTo("ethereum").notNullable().alter();
});