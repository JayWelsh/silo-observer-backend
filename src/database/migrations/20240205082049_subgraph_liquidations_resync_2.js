const {
  SUBGRAPH_LIQUIDATION_RECORD_TABLE,
  SUBGRAPH_INDEXER_BLOCK_TRACKER_TABLE,
} = require("../tables");

exports.up = (knex) => knex.schema.alterTable(SUBGRAPH_LIQUIDATION_RECORD_TABLE, async (table) => {
  await knex(SUBGRAPH_LIQUIDATION_RECORD_TABLE).truncate();
  await knex(SUBGRAPH_INDEXER_BLOCK_TRACKER_TABLE).where({ record_type: "Liquidation" }).update({last_checked_block: 0});
})

exports.down = (knex) => knex.schema.alterTable(SUBGRAPH_LIQUIDATION_RECORD_TABLE, table => {
  return true;
});