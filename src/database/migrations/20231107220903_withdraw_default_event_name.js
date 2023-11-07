const {
  WITHDRAW_EVENT_TABLE,
} = require("../tables");

exports.up = (knex) => knex.schema.alterTable(WITHDRAW_EVENT_TABLE, table => {
  table.string("event_name").index().defaultTo("withdraw");
})

exports.down = (knex) => knex.schema.alterTable(WITHDRAW_EVENT_TABLE, table => {
  table.dropColumn("event_name");
});