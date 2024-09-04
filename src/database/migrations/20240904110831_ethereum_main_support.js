const {
  EVENT_INDEXER_BLOCK_TRACKER_TABLE,
  SUBGRAPH_INDEXER_BLOCK_TRACKER_TABLE,
} = require("../tables");

exports.up = (knex) => knex.schema.alterTable(EVENT_INDEXER_BLOCK_TRACKER_TABLE, table => {
  return true;
}).then(function () {
  return knex(EVENT_INDEXER_BLOCK_TRACKER_TABLE).insert([
      {event_name: "Borrow", meta: 'silo_main_v1', genesis_block: 20367994, network: "ethereum", deployment_id: "ethereum-main"},
      {event_name: "Repay", meta: 'silo_main_v1', genesis_block: 20367994, network: "ethereum", deployment_id: "ethereum-main"},
      {event_name: "Deposit", meta: 'silo_main_v1', genesis_block: 20367994, network: "ethereum", deployment_id: "ethereum-main"},
      {event_name: "Withdraw", meta: 'silo_main_v1', genesis_block: 20367994, network: "ethereum", deployment_id: "ethereum-main"},
  ]);
}).then(function () {
  return knex(SUBGRAPH_INDEXER_BLOCK_TRACKER_TABLE).insert([
      // {record_type: "Liquidation-Sanity", meta: 'silo_main_v1', genesis_block: 17782576, network: "ethereum", deployment_id: "ethereum-main", is_sanity_checker: true},
      {record_type: "Liquidation", meta: 'silo_main_v1', genesis_block: 20367994, network: "ethereum", deployment_id: "ethereum-main", is_sanity_checker: false},
  ]);
}).then(function () {
  return knex(EVENT_INDEXER_BLOCK_TRACKER_TABLE).insert([
    {event_name: "RewardsClaimed", meta: 'silo_rewards_main_q4_2024', genesis_block: 20368103, network: "ethereum", deployment_id: "ethereum-main"},
  ]);
});
// Use this when wanting to add the sanity checking for ethereum-main
// .then(function () {
//   return knex(EVENT_INDEXER_BLOCK_TRACKER_TABLE).insert([
//       {event_name: "Borrow-Sanity", meta: 'silo_main_v1', genesis_block: 20367994, network: "ethereum", deployment_id: "ethereum-main", is_sanity_checker: true},
//       {event_name: "Repay-Sanity", meta: 'silo_main_v1', genesis_block: 20367994, network: "ethereum", deployment_id: "ethereum-main", is_sanity_checker: true},
//       {event_name: "Deposit-Sanity", meta: 'silo_main_v1', genesis_block: 20367994, network: "ethereum", deployment_id: "ethereum-main", is_sanity_checker: true},
//       {event_name: "Withdraw-Sanity", meta: 'silo_main_v1', genesis_block: 20367994, network: "ethereum", deployment_id: "ethereum-main", is_sanity_checker: true},
//   ]);
// })

exports.down = (knex) => knex.schema.alterTable(EVENT_INDEXER_BLOCK_TRACKER_TABLE, table => {
  return knex(EVENT_INDEXER_BLOCK_TRACKER_TABLE).where({ deployment_id: "ethereum-main" }).delete();
}).then(function () {
  return knex(SUBGRAPH_INDEXER_BLOCK_TRACKER_TABLE).where({ deployment_id: "ethereum-main" }).delete();
}).then(async () => {
  await knex(EVENT_INDEXER_BLOCK_TRACKER_TABLE).where({ deployment_id: "ethereum-main" }).delete();
});