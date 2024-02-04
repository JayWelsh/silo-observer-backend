const {
  SUBGRAPH_INDEXER_BLOCK_TRACKER_TABLE,
} = require("../tables");

exports.up = (knex) => knex.schema.alterTable(SUBGRAPH_INDEXER_BLOCK_TRACKER_TABLE, table => {
  return true;
}).then(function () {
  return knex(SUBGRAPH_INDEXER_BLOCK_TRACKER_TABLE).insert([
      // {record_type: "Liquidation-Sanity", meta: 'silo_v1_llama', genesis_block: 17782576, network: "ethereum", deployment_id: "ethereum-llama", is_sanity_checker: true},
      // {record_type: "Liquidation-Sanity", meta: 'silo_v1', genesis_block: 51894500, network: "arbitrum", deployment_id: "arbitrum-original", is_sanity_checker: true},
      // {record_type: "Liquidation-Sanity", meta: 'silo_v1', genesis_block: 15307000, network: "ethereum", deployment_id: "ethereum-original", is_sanity_checker: true},
      {record_type: "Liquidation", meta: 'silo_v1_llama', genesis_block: 17782576, network: "ethereum", deployment_id: "ethereum-llama", is_sanity_checker: false},
      {record_type: "Liquidation", meta: 'silo_v1', genesis_block: 51894500, network: "arbitrum", deployment_id: "arbitrum-original", is_sanity_checker: false},
      {record_type: "Liquidation", meta: 'silo_v1', genesis_block: 15307000, network: "ethereum", deployment_id: "ethereum-original", is_sanity_checker: false},
  ]);
})

exports.down = (knex) => knex.schema.alterTable(SUBGRAPH_INDEXER_BLOCK_TRACKER_TABLE, table => {
  return true;
}).then(function() {
  return knex(SUBGRAPH_INDEXER_BLOCK_TRACKER_TABLE).where({ record_type: "Liquidation-Sanity" }).delete();
}).then(function() {
  return knex(SUBGRAPH_INDEXER_BLOCK_TRACKER_TABLE).where({ record_type: "Liquidation" }).delete();
})