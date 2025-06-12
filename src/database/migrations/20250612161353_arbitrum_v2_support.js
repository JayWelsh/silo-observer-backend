const {
  EVENT_INDEXER_BLOCK_TRACKER_TABLE,
} = require("../tables");

const SILO_FACTORY_V2_ADDRESS_ARBITRUM = '0x384DC7759d35313F0b567D42bf2f611B285B657C';

exports.up = (knex) => knex.schema.alterTable(EVENT_INDEXER_BLOCK_TRACKER_TABLE, table => {
  return true;
}).then(function () {
  return knex(EVENT_INDEXER_BLOCK_TRACKER_TABLE).insert([
      {event_name: "NewSilo", meta: `silo_v2_factory_${SILO_FACTORY_V2_ADDRESS_ARBITRUM}`, genesis_block: 334531851, network: "arbitrum", deployment_id: "arbitrum-main-v2", protocol_version: 2},
      {event_name: "Borrow", meta: 'silo_v2', genesis_block: 334531851, network: "arbitrum", deployment_id: "arbitrum-main-v2", protocol_version: 2},
      {event_name: "Repay", meta: 'silo_v2', genesis_block: 334531851, network: "arbitrum", deployment_id: "arbitrum-main-v2", protocol_version: 2},
      {event_name: "Deposit", meta: 'silo_v2', genesis_block: 334531851, network: "arbitrum", deployment_id: "arbitrum-main-v2", protocol_version: 2},
      {event_name: "Withdraw", meta: 'silo_v2', genesis_block: 334531851, network: "arbitrum", deployment_id: "arbitrum-main-v2", protocol_version: 2},
  ]);
})

exports.down = (knex) => knex.schema.alterTable(EVENT_INDEXER_BLOCK_TRACKER_TABLE, table => {
  return true;
}).then(function() {
  return knex(EVENT_INDEXER_BLOCK_TRACKER_TABLE).where({ deployment_id: "arbitrum-main-v2" }).delete();
})