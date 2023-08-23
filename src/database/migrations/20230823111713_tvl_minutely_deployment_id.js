const {
  TVL_MINUTELY_TABLE,
} = require("../tables");

exports.up = (knex) => knex.schema.alterTable(TVL_MINUTELY_TABLE, table => {
  table.string("deployment_id");
}).then(async () => {
  await knex(TVL_MINUTELY_TABLE).where({ network: "ethereum" }).update('deployment_id', 'ethereum-original');
  return knex(TVL_MINUTELY_TABLE).where({ network: "arbitrum" }).update('deployment_id', 'arbitrum-original');
}).then(() => knex.schema.alterTable(TVL_MINUTELY_TABLE, table => {
  table.string("deployment_id").index().notNullable().alter();
}))

exports.down = (knex) => knex.schema.alterTable(TVL_MINUTELY_TABLE, table => {
  table.dropColumn("deployment_id");
});