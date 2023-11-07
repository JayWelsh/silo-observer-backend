const {
  BORROW_EVENT_TABLE,
} = require("../tables");

exports.up = (knex) => knex.schema.alterTable(BORROW_EVENT_TABLE, table => {
  table.string("event_name").index().defaultTo("borrow");
})

exports.down = (knex) => knex.schema.alterTable(BORROW_EVENT_TABLE, table => {
  table.dropColumn("event_name");
});