const {
  RATE_TABLE,
} = require("../tables");

exports.up = (knex) => knex.schema.alterTable(RATE_TABLE, table => {
  table.decimal("rate", 21, 13).notNullable().alter();
});

exports.down = (knex) => knex.schema.alterTable(RATE_TABLE, table => {
  table.decimal("rate", 16, 13).notNullable().alter();
});