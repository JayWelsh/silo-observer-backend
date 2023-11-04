const {
  WITHDRAW_EVENT_TABLE,
} = require("../tables");

exports.up = (knex) => knex.schema.alterTable(WITHDRAW_EVENT_TABLE, table => {
  table.decimal("asset_price_at_event_time", 24, 8).nullable();
})

exports.down = (knex) => knex.schema.alterTable(WITHDRAW_EVENT_TABLE, table => {
  table.dropColumn("asset_price_at_event_time");
});