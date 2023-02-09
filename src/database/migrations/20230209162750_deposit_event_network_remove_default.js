const {
  DEPOSIT_EVENT_TABLE,
} = require("../tables");

exports.up = (knex) => knex.schema.alterTable(DEPOSIT_EVENT_TABLE, table => {
  table.string("network").notNullable().alter();
});

exports.down = (knex) => knex.schema.alterTable(DEPOSIT_EVENT_TABLE, table => {
  table.string("network").defaultTo("ethereum").notNullable().alter();
});