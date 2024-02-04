const {
  SILO_TABLE,
  ASSET_TABLE,
  SUBGRAPH_LIQUIDATION_RECORD_TABLE,
  SUBGRAPH_INDEXER_BLOCK_TRACKER_TABLE,
} = require("../tables");

// return `{
//   liquidates(
//     where:{amount_gt: 0, blockNumber_gte: ${blockNumberStart}, blockNumber_lte: ${blockNumberEnd}}
//     orderBy: timestamp,
//     orderDirection: desc,
//     first: ${first},
//     skip: ${skip},
//   ){
  //   id /
  //   blockNumber /
  //   logIndex /
  //   silo { /
  //     id/
  //   }/
  //   asset {/
  //     id/
  //   }/
  //   amount/
  //   amountUSD/
  //   profitUSD/
  //   liquidator { id }/
  //   liquidatee { id }/
  //   hash/
  //   timestamp/
  // }
// }`

exports.up = async (knex) => {
  await knex.schema.dropTable(SUBGRAPH_LIQUIDATION_RECORD_TABLE);
  await knex(SUBGRAPH_INDEXER_BLOCK_TRACKER_TABLE).where({ record_type: "Liquidation" }).delete();
  return knex(SUBGRAPH_INDEXER_BLOCK_TRACKER_TABLE).insert([
    {record_type: "Liquidation", meta: 'silo_v1_llama', genesis_block: 17782576, network: "ethereum", deployment_id: "ethereum-llama", is_sanity_checker: false},
    {record_type: "Liquidation", meta: 'silo_v1', genesis_block: 51894500, network: "arbitrum", deployment_id: "arbitrum-original", is_sanity_checker: false},
    {record_type: "Liquidation", meta: 'silo_v1', genesis_block: 15307000, network: "ethereum", deployment_id: "ethereum-original", is_sanity_checker: false},
]);
}

exports.down = knex => knex.schema.createTable(SUBGRAPH_LIQUIDATION_RECORD_TABLE, table => {
  table.increments();
  table.string("record_fingerprint").unique().index().notNullable();
  table.integer("block_number").index().notNullable();
  table.string("silo_address")
    .index()
    .references(`${SILO_TABLE}.address`)
    .onUpdate('CASCADE')
    .onDelete('CASCADE')
    .notNullable();
  table.string("asset_address")
    .index()
    .references(`${ASSET_TABLE}.address`)
    .onUpdate('CASCADE')
    .onDelete('CASCADE')
    .nullable();
  table.string("liquidator")
    .index()
    .notNullable()
  table.string("liquidatee")
    .index()
    .notNullable()
  table.decimal("amount", 78, 0)
    .notNullable()
  table.decimal("amountUSD", 78, 0)
    .notNullable()
  table.decimal("profitUSD", 78, 0)
    .notNullable()
  table.string("tx_hash")
    .notNullable()
  table.integer("timestamp_unix").notNullable();
  table.string("network").index().notNullable();
  table.string("deployment_id").index().notNullable();
  table.timestamps(true, true);
});