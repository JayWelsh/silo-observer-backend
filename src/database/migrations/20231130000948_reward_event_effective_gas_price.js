const {
  REWARD_EVENT_TABLE,
} = require("../tables");

exports.up = (knex) => knex.schema.alterTable(REWARD_EVENT_TABLE, async (table) => {
  return true;
}).then(() => knex.schema.alterTable(REWARD_EVENT_TABLE, table => {
  table.integer("effective_gas_price").nullable();
}))

exports.down = (knex) => knex.schema.alterTable(REWARD_EVENT_TABLE, table => {
  table.dropColumn("effective_gas_price");
});