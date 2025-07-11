const {
  EVENT_INDEXER_BLOCK_TRACKER_TABLE,
} = require("../tables");

const SILO_LENS_V2_ADDRESS_SONIC_MAY_2025 = '0x4e9dE3a64c911A37f7EB2fCb06D1e68c3cBe9203';

exports.up = (knex) => knex.schema.alterTable(EVENT_INDEXER_BLOCK_TRACKER_TABLE, table => {
  return true;
}).then(function () {
  return knex(EVENT_INDEXER_BLOCK_TRACKER_TABLE).insert([
      {event_name: "NewSilo", meta: `silo_v2_factory_${SILO_LENS_V2_ADDRESS_SONIC_MAY_2025}`, genesis_block: 25244110, network: "sonic", deployment_id: "sonic-main-revised-v2", protocol_version: 2},
  ]);
})

exports.down = (knex) => knex.schema.alterTable(EVENT_INDEXER_BLOCK_TRACKER_TABLE, table => {
  return true;
}).then(function() {
  return knex(EVENT_INDEXER_BLOCK_TRACKER_TABLE)
  .whereIn('meta', [
    `silo_v2_factory_${SILO_LENS_V2_ADDRESS_SONIC_MAY_2025}`,
  ])
  .delete();
})