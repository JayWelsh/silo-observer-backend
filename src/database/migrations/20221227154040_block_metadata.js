const {
  BLOCK_METADATA_TABLE,
} = require("../tables");

exports.up = (knex) => knex.schema.createTable(BLOCK_METADATA_TABLE, table => {
  table.increments();
  table.integer("block_number").index().notNullable();
  table.integer("block_timestamp_unix").notNullable();
  table.timestamp('block_timestamp').notNullable();
  table.timestamp('block_day_timestamp').notNullable();
  table.timestamps(true, true);
});

exports.down = knex => knex.schema.dropTable(BLOCK_METADATA_TABLE);