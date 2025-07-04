const {
  EVENT_INDEXER_BLOCK_TRACKER_TABLE,
} = require("../tables");

const SILO_FACTORY_V2_ADDRESS_AVALANCHE = '0x92cECB67Ed267FF98026F814D813fDF3054C6Ff9';

exports.up = (knex) => knex.schema.alterTable(EVENT_INDEXER_BLOCK_TRACKER_TABLE, table => {
  return true;
}).then(function () {
  return knex(EVENT_INDEXER_BLOCK_TRACKER_TABLE).insert([
      {event_name: "NewSilo", meta: `silo_v2_factory_${SILO_FACTORY_V2_ADDRESS_AVALANCHE}`, genesis_block: 64050356, network: "avalanche", deployment_id: "avalanche-main-v2", protocol_version: 2},
  ]);
})

exports.down = (knex) => knex.schema.alterTable(EVENT_INDEXER_BLOCK_TRACKER_TABLE, table => {
  return true;
}).then(function() {
  return knex(EVENT_INDEXER_BLOCK_TRACKER_TABLE).where({ deployment_id: "avalanche-main-v2" }).delete();
})