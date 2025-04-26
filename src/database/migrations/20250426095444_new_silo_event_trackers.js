const {
  EVENT_INDEXER_BLOCK_TRACKER_TABLE,
} = require("../tables");

const SILO_FACTORY_ADDRESS = '0x4D919CEcfD4793c0D47866C8d0a02a0950737589';
const SILO_LLAMA_FACTORY_ADDRESS = '0x2c0fA05281730EFd3ef71172d8992500B36b56eA';
const SILO_FACTORY_MAIN_ADDRESS = '0xB7d391192080674281bAAB8B3083154a5f64cd0a';
const SILO_CONVEX_FACTORY_ADDRESS = '0x6d4A256695586F61b77B09bc3D28333A91114d5a';
const SILO_FACTORY_ADDRESS_ARBITRUM = '0x4166487056A922D784b073d4d928a516B074b719';
const SILO_FACTORY_V2_ADDRESS_ARBITRUM = '0xf7dc975C96B434D436b9bF45E7a45c95F0521442';
const SILO_FACTORY_ADDRESS_OPTIMISM = '0x6B14c4450a29Dd9562c20259eBFF67a577b540b9';
const SILO_FACTORY_ADDRESS_BASE = '0x408822E4E8682413666809b0655161093cd36f2b';
const SILO_FACTORY_ADDRESS_BASE_BTCFI = '0x2899b0C131225CbcE912Ba14Bbb7e1C88f2462B5';
const SILO_FACTORY_V2_ADDRESS_SONIC = '0xa42001D6d2237d2c74108FE360403C4b796B7170';

exports.up = (knex) => knex.schema.alterTable(EVENT_INDEXER_BLOCK_TRACKER_TABLE, table => {
  return true;
}).then(function () {
  return knex(EVENT_INDEXER_BLOCK_TRACKER_TABLE).insert([
      {event_name: "NewSilo", meta: `silo_v2_factory_${SILO_FACTORY_V2_ADDRESS_SONIC}`, genesis_block: 2672166, network: "sonic", deployment_id: "sonic-main-v2", protocol_version: 2},
      {event_name: "NewSiloCreated", meta: `silo_v1_factory_${SILO_FACTORY_ADDRESS}`, genesis_block: 15307294, network: "ethereum", deployment_id: "ethereum-original", protocol_version: 1},
      {event_name: "NewSiloCreated", meta: `silo_v1_factory_${SILO_CONVEX_FACTORY_ADDRESS}`, genesis_block: 17391886, network: "ethereum", deployment_id: "ethereum-convex", protocol_version: 1},
      {event_name: "NewSiloCreated", meta: `silo_v1_factory_${SILO_FACTORY_MAIN_ADDRESS}`, genesis_block: 20367992, network: "ethereum", deployment_id: "ethereum-main", protocol_version: 1},
      {event_name: "NewSiloCreated", meta: `silo_v1_factory_${SILO_LLAMA_FACTORY_ADDRESS}`, genesis_block: 17782577, network: "ethereum", deployment_id: "ethereum-llama", protocol_version: 1},
      {event_name: "NewSiloCreated", meta: `silo_v1_factory_${SILO_FACTORY_ADDRESS_ARBITRUM}`, genesis_block: 51894508, network: "arbitrum", deployment_id: "arbitrum-original", protocol_version: 1},
      {event_name: "NewSiloCreated", meta: `silo_v1_factory_${SILO_FACTORY_ADDRESS_OPTIMISM}`, genesis_block: 120480601, network: "optimism", deployment_id: "optimism-original", protocol_version: 1},
      {event_name: "NewSiloCreated", meta: `silo_v1_factory_${SILO_FACTORY_ADDRESS_BASE}`, genesis_block: 16262586, network: "base", deployment_id: "base-original", protocol_version: 1},
      {event_name: "NewSiloCreated", meta: `silo_v1_factory_${SILO_FACTORY_ADDRESS_BASE_BTCFI}`, genesis_block: 22674832, network: "base", deployment_id: "base-btcfi", protocol_version: 1},
  ]);
})

exports.down = (knex) => knex.schema.alterTable(EVENT_INDEXER_BLOCK_TRACKER_TABLE, table => {
  return true;
}).then(function() {
  return knex(EVENT_INDEXER_BLOCK_TRACKER_TABLE)
  .whereIn('meta', [
    `silo_v2_factory_${SILO_FACTORY_V2_ADDRESS_SONIC}`,
    `silo_v1_factory_${SILO_FACTORY_ADDRESS}`,
    `silo_v1_factory_${SILO_CONVEX_FACTORY_ADDRESS}`,
    `silo_v1_factory_${SILO_FACTORY_MAIN_ADDRESS}`,
    `silo_v1_factory_${SILO_LLAMA_FACTORY_ADDRESS}`,
    `silo_v1_factory_${SILO_FACTORY_ADDRESS_ARBITRUM}`,
    `silo_v1_factory_${SILO_FACTORY_ADDRESS_OPTIMISM}`,
    `silo_v1_factory_${SILO_FACTORY_ADDRESS_BASE}`,
    `silo_v1_factory_${SILO_FACTORY_ADDRESS_BASE_BTCFI}`,
  ])
  .delete();
})