const {
  BLOCK_METADATA_TABLE,
} = require("../tables");

exports.up = (knex) => knex.schema.alterTable(BLOCK_METADATA_TABLE, table => {
  table.integer("block_timestamp_unix").index().alter();
});

exports.down = (knex) => knex.schema.alterTable(BLOCK_METADATA_TABLE, table => {
  table.dropIndex(["block_timestamp_unix"]);
});