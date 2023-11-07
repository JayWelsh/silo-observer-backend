const {
  REPAY_EVENT_TABLE,
} = require("../tables");

exports.up = (knex) => knex.schema.alterTable(REPAY_EVENT_TABLE, table => {
  table.string("event_name").index().defaultTo("repay");
})

exports.down = (knex) => knex.schema.alterTable(REPAY_EVENT_TABLE, table => {
  table.dropColumn("event_name");
});