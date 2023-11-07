const {
  DEPOSIT_EVENT_TABLE,
} = require("../tables");

exports.up = (knex) => knex.schema.alterTable(DEPOSIT_EVENT_TABLE, table => {
  table.string("event_name").index().defaultTo("deposit");
})

exports.down = (knex) => knex.schema.alterTable(DEPOSIT_EVENT_TABLE, table => {
  table.dropColumn("event_name");
});