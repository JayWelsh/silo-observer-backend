const {
  SILO_TABLE,
  ASSET_TABLE,
  SUBGRAPH_LIQUIDATION_RECORD_TABLE,
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

exports.up = (knex) => knex.schema.createTable(SUBGRAPH_LIQUIDATION_RECORD_TABLE, table => {
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

exports.down = knex => knex.schema.dropTable(SUBGRAPH_LIQUIDATION_RECORD_TABLE);