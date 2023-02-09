const {
  EVENT_INDEXER_BLOCK_TRACKER_TABLE,
} = require("../tables");

exports.up = (knex) => knex.schema.alterTable(EVENT_INDEXER_BLOCK_TRACKER_TABLE, table => {
  table.string("network").index().defaultTo("ethereum").notNullable();
}).then(function () {
  return knex(EVENT_INDEXER_BLOCK_TRACKER_TABLE).insert([
      {event_name: "Borrow", meta: 'silo_v1', genesis_block: 51894500, network: "arbitrum"},
      {event_name: "Repay", meta: 'silo_v1', genesis_block: 51894500, network: "arbitrum"},
      {event_name: "Deposit", meta: 'silo_v1', genesis_block: 51894500, network: "arbitrum"},
      {event_name: "Withdraw", meta: 'silo_v1', genesis_block: 51894500, network: "arbitrum"},
  ]);
});

exports.down = (knex) => knex.schema.alterTable(EVENT_INDEXER_BLOCK_TRACKER_TABLE, table => {
  table.dropColumn("network");
});