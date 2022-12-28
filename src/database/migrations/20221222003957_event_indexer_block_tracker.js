const {
  EVENT_INDEXER_BLOCK_TRACKER_TABLE,
} = require("../tables");

exports.up = (knex) => knex.schema.createTable(EVENT_INDEXER_BLOCK_TRACKER_TABLE, table => {
  table.increments();
  table.string("event_name").index().notNullable();
  table.integer("last_checked_block").index().nullable();
  table.integer("genesis_block").index().notNullable().defaultTo(15307294); // Block 15307294 = deployment block of SiloFactory
  table.string("meta").index().nullable();
  table.timestamps(true, true);
}).then(function () {
  return knex(EVENT_INDEXER_BLOCK_TRACKER_TABLE).insert([
      {event_name: "Borrow", meta: 'silo_v1', genesis_block: 15307000},
      {event_name: "Repay", meta: 'silo_v1', genesis_block: 15307000},
      {event_name: "Deposit", meta: 'silo_v1', genesis_block: 15307000},
      {event_name: "Withdraw", meta: 'silo_v1', genesis_block: 15307000},
  ]);
});

exports.down = knex => knex.schema.dropTable(EVENT_INDEXER_BLOCK_TRACKER_TABLE);