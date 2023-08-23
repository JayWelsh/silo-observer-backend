const {
  WITHDRAW_EVENT_TABLE,
} = require("../tables");

exports.up = (knex) => knex.schema.alterTable(WITHDRAW_EVENT_TABLE, table => {
  table.string("deployment_id");
}).then(async () => {
  await knex(WITHDRAW_EVENT_TABLE).where({ network: "ethereum" }).update('deployment_id', 'ethereum-original');
  return knex(WITHDRAW_EVENT_TABLE).where({ network: "arbitrum" }).update('deployment_id', 'arbitrum-original');
}).then(() => knex.schema.alterTable(WITHDRAW_EVENT_TABLE, table => {
  table.string("deployment_id").index().notNullable().alter();
}))

exports.down = (knex) => knex.schema.alterTable(WITHDRAW_EVENT_TABLE, table => {
  table.dropColumn("deployment_id");
});