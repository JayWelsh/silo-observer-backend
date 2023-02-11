const {
  RATE_TABLE,
} = require("../tables");

exports.up = (knex) => knex.schema.alterTable(RATE_TABLE, table => {
  table.string("network").index().defaultTo("ethereum").notNullable();
});

exports.down = (knex) => knex.schema.alterTable(RATE_TABLE, table => {
  table.dropColumn("network");
});