const {
  RATE_LATEST_TABLE,
} = require("../tables");

exports.up = (knex) => knex.schema.alterTable(RATE_LATEST_TABLE, table => {
  table.string("network").index().defaultTo("ethereum").notNullable();
});

exports.down = (knex) => knex.schema.alterTable(RATE_LATEST_TABLE, table => {
  table.dropColumn("network");
});