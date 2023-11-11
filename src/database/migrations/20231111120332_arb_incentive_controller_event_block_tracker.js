const {
  EVENT_INDEXER_BLOCK_TRACKER_TABLE,
} = require("../tables");

exports.up = (knex) => knex.schema.alterTable(EVENT_INDEXER_BLOCK_TRACKER_TABLE, table => {
  return true;
}).then(function () {
  return knex(EVENT_INDEXER_BLOCK_TRACKER_TABLE).insert([
    {event_name: "RewardsClaimed", meta: 'arb_rewards_q4_2023', genesis_block: 146008194, network: "arbitrum", deployment_id: "arbitrum-original"},
  ]);
});

exports.down = (knex) => knex.schema.alterTable(EVENT_INDEXER_BLOCK_TRACKER_TABLE, table => {
  return true;
}).then(function() {
  return knex(EVENT_INDEXER_BLOCK_TRACKER_TABLE).where({ meta: "arb_rewards_q4_2023" }).delete();
});