const {
  EVENT_INDEXER_BLOCK_TRACKER_TABLE,
} = require("../tables");

const SILO_PT_TOKEN_FACTORY_ADDRESS_ARBITRUM = "0xa82837464c1DA27935E750717A423E738B408878";

exports.up = (knex) => knex.schema.alterTable(EVENT_INDEXER_BLOCK_TRACKER_TABLE, table => {
  return true;
}).then(function () {
  return knex(EVENT_INDEXER_BLOCK_TRACKER_TABLE).insert([
      {event_name: "NewSiloCreated", meta: `silo_v1_factory_${SILO_PT_TOKEN_FACTORY_ADDRESS_ARBITRUM}`, genesis_block: 185062167, network: "arbitrum", deployment_id: "arbitrum-pt", protocol_version: 1},
  ]);
})

exports.down = (knex) => knex.schema.alterTable(EVENT_INDEXER_BLOCK_TRACKER_TABLE, table => {
  return true;
}).then(function() {
  return knex(EVENT_INDEXER_BLOCK_TRACKER_TABLE)
  .whereIn('meta', [
    `silo_v1_factory_${SILO_PT_TOKEN_FACTORY_ADDRESS_ARBITRUM}`,
  ])
  .delete();
})