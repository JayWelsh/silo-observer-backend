const {
  WITHDRAW_EVENT_TABLE,
} = require("../tables");

exports.up = (knex) => knex.schema.alterTable(WITHDRAW_EVENT_TABLE, async (table) => {
  await knex(WITHDRAW_EVENT_TABLE).truncate();
}).then(() => knex.schema.alterTable(WITHDRAW_EVENT_TABLE, table => {
  table.decimal("usd_value_at_event_time", 16, 2).nullable();
  table.integer("log_index").notNullable();
  table.integer("tx_index").notNullable();
  table.string("event_fingerprint").unique().index().notNullable();
}))

exports.down = (knex) => knex.schema.alterTable(WITHDRAW_EVENT_TABLE, table => {
  table.dropColumn("usd_value_at_event_time");
  table.dropColumn("event_fingerprint");
  table.dropColumn("log_index");
  table.dropColumn("tx_index");
});