const {
  EVENT_INDEXER_BLOCK_TRACKER_TABLE,
} = require("../tables");

exports.up = (knex) => knex.schema.alterTable(EVENT_INDEXER_BLOCK_TRACKER_TABLE, table => {
  return true;
}).then(function () {
  return knex(EVENT_INDEXER_BLOCK_TRACKER_TABLE).insert([
    {event_name: "RewardsClaimed", meta: 'silo_rewards_q1_2024', genesis_block: 194363994, network: "arbitrum", deployment_id: "arbitrum-original"},
    {event_name: "RewardsClaimed", meta: 'silo_rewards_q1_2023', genesis_block: 16689568, network: "ethereum", deployment_id: "ethereum-original"},
    {event_name: "RewardsClaimed", meta: 'op_rewards_q1_2024', genesis_block: 120481675, network: "optimism", deployment_id: "optimism-original"},
  ]);
});

exports.down = (knex) => knex.schema.alterTable(EVENT_INDEXER_BLOCK_TRACKER_TABLE, table => {
  return true;
}).then(async () => {
  await knex(EVENT_INDEXER_BLOCK_TRACKER_TABLE).where({ meta: "silo_rewards_q1_2024" }).delete();
  await knex(EVENT_INDEXER_BLOCK_TRACKER_TABLE).where({ meta: "silo_rewards_q1_2023" }).delete();
  return knex(EVENT_INDEXER_BLOCK_TRACKER_TABLE).where({ meta: "op_rewards_q1_2024" }).delete();
});