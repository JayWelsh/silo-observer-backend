const {
  EVENT_INDEXER_BLOCK_TRACKER_TABLE,
} = require("../tables");

exports.up = (knex) => knex.schema.alterTable(EVENT_INDEXER_BLOCK_TRACKER_TABLE, table => {
  table.string("deployment_id");
}).then(async () => {
  await knex(EVENT_INDEXER_BLOCK_TRACKER_TABLE).where({ network: "ethereum" }).update('deployment_id', 'ethereum-original');
  return knex(EVENT_INDEXER_BLOCK_TRACKER_TABLE).where({ network: "arbitrum" }).update('deployment_id', 'arbitrum-original');
}).then(() => knex.schema.alterTable(EVENT_INDEXER_BLOCK_TRACKER_TABLE, table => {
  table.string("deployment_id").index().notNullable().alter();
})).then(function () {
  return knex(EVENT_INDEXER_BLOCK_TRACKER_TABLE).insert([
      {event_name: "Borrow", meta: 'silo_v1_llama', genesis_block: 17782576, network: "ethereum", deployment_id: "ethereum-llama"},
      {event_name: "Repay", meta: 'silo_v1_llama', genesis_block: 17782576, network: "ethereum", deployment_id: "ethereum-llama"},
      {event_name: "Deposit", meta: 'silo_v1_llama', genesis_block: 17782576, network: "ethereum", deployment_id: "ethereum-llama"},
      {event_name: "Withdraw", meta: 'silo_v1_llama', genesis_block: 17782576, network: "ethereum", deployment_id: "ethereum-llama"},
  ]);
});

exports.down = (knex) => knex.schema.alterTable(EVENT_INDEXER_BLOCK_TRACKER_TABLE, table => {
  table.dropColumn("deployment_id");
});