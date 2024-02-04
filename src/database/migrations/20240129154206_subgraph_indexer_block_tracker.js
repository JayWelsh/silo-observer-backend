const {
  SUBGRAPH_INDEXER_BLOCK_TRACKER_TABLE,
} = require("../tables");

exports.up = (knex) => knex.schema.createTable(SUBGRAPH_INDEXER_BLOCK_TRACKER_TABLE, table => {
  table.increments();
  table.string("record_type").index().notNullable();
  table.integer("last_checked_block").index().nullable();
  table.integer("genesis_block").index().notNullable().defaultTo(15307294); // Block 15307294 = deployment block of SiloFactory
  table.string("meta").index().nullable();
  table.string("network").notNullable();
  table.string("deployment_id").index().notNullable();
  table.boolean("is_sanity_checker").defaultTo(false);
  table.timestamps(true, true);
})

exports.down = knex => knex.schema.dropTable(SUBGRAPH_INDEXER_BLOCK_TRACKER_TABLE);