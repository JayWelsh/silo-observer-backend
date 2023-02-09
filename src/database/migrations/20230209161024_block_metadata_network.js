const {
  BLOCK_METADATA_TABLE,
} = require("../tables");

exports.up = (knex) => knex.schema.alterTable(BLOCK_METADATA_TABLE, table => {
  table.string("network").index().defaultTo("ethereum").notNullable();
});

exports.down = (knex) => knex.schema.alterTable(BLOCK_METADATA_TABLE, table => {
  table.dropColumn("network");
});