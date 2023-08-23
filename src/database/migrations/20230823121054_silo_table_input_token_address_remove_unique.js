const {
  SILO_TABLE,
} = require("../tables");

exports.up = (knex) => knex.schema.alterTable(SILO_TABLE, table => {
  table.dropUnique("input_token_address");
});

exports.down = (knex) => knex.schema.alterTable(SILO_TABLE, table => {
  table.unique("input_token_address");
});