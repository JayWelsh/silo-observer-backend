const {
  EVENT_INDEXER_BLOCK_TRACKER_TABLE,
} = require("../tables");

exports.up = (knex) => knex.schema.alterTable(EVENT_INDEXER_BLOCK_TRACKER_TABLE, table => {
  table.boolean("is_sanity_checker").defaultTo(false);
}).then(function () {
  return knex(EVENT_INDEXER_BLOCK_TRACKER_TABLE).insert([
    {event_name: "RewardsClaimed-Sanity", meta: 'arb_rewards_q4_2023', genesis_block: 146008194, network: "arbitrum", deployment_id: "arbitrum-original", is_sanity_checker: true},
  ]);
}).then(function () {
  return knex(EVENT_INDEXER_BLOCK_TRACKER_TABLE).insert([
      {event_name: "Borrow-Sanity", meta: 'silo_v1_llama', genesis_block: 17782576, network: "ethereum", deployment_id: "ethereum-llama", is_sanity_checker: true},
      {event_name: "Repay-Sanity", meta: 'silo_v1_llama', genesis_block: 17782576, network: "ethereum", deployment_id: "ethereum-llama", is_sanity_checker: true},
      {event_name: "Deposit-Sanity", meta: 'silo_v1_llama', genesis_block: 17782576, network: "ethereum", deployment_id: "ethereum-llama", is_sanity_checker: true},
      {event_name: "Withdraw-Sanity", meta: 'silo_v1_llama', genesis_block: 17782576, network: "ethereum", deployment_id: "ethereum-llama", is_sanity_checker: true},
  ]);
}).then(function () {
  return knex(EVENT_INDEXER_BLOCK_TRACKER_TABLE).insert([
      {event_name: "Borrow-Sanity", meta: 'silo_v1', genesis_block: 51894500, network: "arbitrum", deployment_id: "arbitrum-original", is_sanity_checker: true},
      {event_name: "Repay-Sanity", meta: 'silo_v1', genesis_block: 51894500, network: "arbitrum", deployment_id: "arbitrum-original", is_sanity_checker: true},
      {event_name: "Deposit-Sanity", meta: 'silo_v1', genesis_block: 51894500, network: "arbitrum", deployment_id: "arbitrum-original", is_sanity_checker: true},
      {event_name: "Withdraw-Sanity", meta: 'silo_v1', genesis_block: 51894500, network: "arbitrum", deployment_id: "arbitrum-original", is_sanity_checker: true},
  ]);
}).then(function () {
  return knex(EVENT_INDEXER_BLOCK_TRACKER_TABLE).insert([
      {event_name: "Borrow-Sanity", meta: 'silo_v1', genesis_block: 15307000, network: "ethereum", deployment_id: "ethereum-original", is_sanity_checker: true},
      {event_name: "Repay-Sanity", meta: 'silo_v1', genesis_block: 15307000, network: "ethereum", deployment_id: "ethereum-original", is_sanity_checker: true},
      {event_name: "Deposit-Sanity", meta: 'silo_v1', genesis_block: 15307000, network: "ethereum", deployment_id: "ethereum-original", is_sanity_checker: true},
      {event_name: "Withdraw-Sanity", meta: 'silo_v1', genesis_block: 15307000, network: "ethereum", deployment_id: "ethereum-original", is_sanity_checker: true},
  ]);
});

exports.down = (knex) => knex.schema.alterTable(EVENT_INDEXER_BLOCK_TRACKER_TABLE, table => {
  return true;
}).then(function() {
  return knex(EVENT_INDEXER_BLOCK_TRACKER_TABLE).where({ event_name: "RewardsClaimed-Sanity" }).delete();
}).then(function() {
  return knex(EVENT_INDEXER_BLOCK_TRACKER_TABLE).where({ event_name: "Borrow-Sanity" }).delete();
}).then(function() {
  return knex(EVENT_INDEXER_BLOCK_TRACKER_TABLE).where({ event_name: "Repay-Sanity" }).delete();
}).then(function() {
  return knex(EVENT_INDEXER_BLOCK_TRACKER_TABLE).where({ event_name: "Deposit-Sanity" }).delete();
}).then(function() {
  return knex(EVENT_INDEXER_BLOCK_TRACKER_TABLE).where({ event_name: "Withdraw-Sanity" }).delete();
})