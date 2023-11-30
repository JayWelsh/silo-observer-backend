const {
  DEPOSIT_EVENT_TABLE,
} = require("../tables");

exports.up = (knex) => knex.schema.alterTable(DEPOSIT_EVENT_TABLE, async (table) => {
  return true;
}).then(() => knex.schema.alterTable(DEPOSIT_EVENT_TABLE, table => {
  table.string("gas_used").nullable().alter()
}))

exports.down = (knex) => knex.schema.alterTable(DEPOSIT_EVENT_TABLE, table => {
  table.integer("gas_used").nullable().alter();
});