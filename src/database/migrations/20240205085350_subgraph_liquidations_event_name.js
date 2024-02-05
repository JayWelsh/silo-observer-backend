const {
  SUBGRAPH_LIQUIDATION_RECORD_TABLE,
} = require("../tables");

exports.up = (knex) => knex.schema.alterTable(SUBGRAPH_LIQUIDATION_RECORD_TABLE, table => {
  table.string("event_name").index().defaultTo("liquidation");
  table.string("gas_used").nullable();
  table.string("effective_gas_price").nullable();
  table.decimal("usd_value_at_event_time", 16, 2).nullable();
  table.string("event_fingerprint").unique().index().notNullable();
  table.string("user_address").index().notNullable()
})

exports.down = (knex) => knex.schema.alterTable(SUBGRAPH_LIQUIDATION_RECORD_TABLE, table => {
  table.dropColumn("event_name");
  table.dropColumn("gas_used");
  table.dropColumn("effective_gas_price");
  table.dropColumn("usd_value_at_event_time");
  table.dropColumn("user_address");
  table.dropColumn("event_fingerprint");
});