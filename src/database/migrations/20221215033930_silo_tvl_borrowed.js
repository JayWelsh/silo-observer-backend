const {
  SILO_TABLE,
} = require("../tables");

exports.up = (knex) => knex.schema.alterTable(SILO_TABLE, table => {
  table.decimal("tvl", 16, 2).defaultTo(0).notNullable();
  table.decimal("borrowed", 16, 2).defaultTo(0).notNullable();
});

exports.down = (knex) => knex.schema.alterTable(SILO_TABLE, table => {
  table.dropColumn("tvl", 16, 2);
  table.dropColumn("borrowed", 16, 2);
});