const {
  EVENT_INDEXER_BLOCK_TRACKER_TABLE,
} = require("../tables");

exports.up = (knex) => knex.schema.alterTable(EVENT_INDEXER_BLOCK_TRACKER_TABLE, table => {
  return true;
}).then(function () {
  return knex(EVENT_INDEXER_BLOCK_TRACKER_TABLE).insert([
      {event_name: "Borrow", meta: 'silo_v2', genesis_block: 2672166, network: "sonic", deployment_id: "sonic-main-v2", protocol_version: 2},
      {event_name: "Repay", meta: 'silo_v2', genesis_block: 2672166, network: "sonic", deployment_id: "sonic-main-v2", protocol_version: 2},
      {event_name: "Deposit", meta: 'silo_v2', genesis_block: 2672166, network: "sonic", deployment_id: "sonic-main-v2", protocol_version: 2},
      {event_name: "Withdraw", meta: 'silo_v2', genesis_block: 2672166, network: "sonic", deployment_id: "sonic-main-v2", protocol_version: 2},
  ]);
})

exports.down = (knex) => knex.schema.alterTable(EVENT_INDEXER_BLOCK_TRACKER_TABLE, table => {
  return true;
}).then(function() {
  return knex(EVENT_INDEXER_BLOCK_TRACKER_TABLE).where({ deployment_id: "sonic-main-v2" }).delete();
})