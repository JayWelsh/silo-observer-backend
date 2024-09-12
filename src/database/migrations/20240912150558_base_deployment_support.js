const {
  EVENT_INDEXER_BLOCK_TRACKER_TABLE,
  SUBGRAPH_INDEXER_BLOCK_TRACKER_TABLE,
} = require("../tables");

exports.up = (knex) => knex.schema.alterTable(EVENT_INDEXER_BLOCK_TRACKER_TABLE, table => {
  return true;
}).then(function () {
  return knex(EVENT_INDEXER_BLOCK_TRACKER_TABLE).insert([
      {event_name: "Borrow", meta: 'silo_v1', genesis_block: 16262586, network: "base", deployment_id: "base-original"},
      {event_name: "Repay", meta: 'silo_v1', genesis_block: 16262586, network: "base", deployment_id: "base-original"},
      {event_name: "Deposit", meta: 'silo_v1', genesis_block: 16262586, network: "base", deployment_id: "base-original"},
      {event_name: "Withdraw", meta: 'silo_v1', genesis_block: 16262586, network: "base", deployment_id: "base-original"},
  ]);
}).then(function () {
  return knex(SUBGRAPH_INDEXER_BLOCK_TRACKER_TABLE).insert([
      {record_type: "Liquidation", meta: 'silo_v1', genesis_block: 16262586, network: "base", deployment_id: "base-original", is_sanity_checker: false},
  ]);
})
// Use this when wanting to add the sanity checking for base
// .then(function () {
//   return knex(EVENT_INDEXER_BLOCK_TRACKER_TABLE).insert([
//       {event_name: "Borrow-Sanity", meta: 'silo_v1', genesis_block: 16262586, network: "base", deployment_id: "base-original", is_sanity_checker: true},
//       {event_name: "Repay-Sanity", meta: 'silo_v1', genesis_block: 16262586, network: "base", deployment_id: "base-original", is_sanity_checker: true},
//       {event_name: "Deposit-Sanity", meta: 'silo_v1', genesis_block: 16262586, network: "base", deployment_id: "base-original", is_sanity_checker: true},
//       {event_name: "Withdraw-Sanity", meta: 'silo_v1', genesis_block: 16262586, network: "base", deployment_id: "base-original", is_sanity_checker: true},
//   ]);
// })

exports.down = (knex) => knex.schema.alterTable(EVENT_INDEXER_BLOCK_TRACKER_TABLE, table => {
  return knex(EVENT_INDEXER_BLOCK_TRACKER_TABLE).where({ network: "base" }).delete();
}).then(function () {
  return knex(SUBGRAPH_INDEXER_BLOCK_TRACKER_TABLE).where({ network: "base" }).delete();
});