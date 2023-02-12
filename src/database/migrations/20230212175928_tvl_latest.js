const {
  SILO_TABLE,
  ASSET_TABLE,
  TVL_LATEST_TABLE,
} = require("../tables");

exports.up = (knex) => knex.schema.createTable(TVL_LATEST_TABLE, table => {
    table.increments();
    table.string("silo_address")
      .index()
      .references(`${SILO_TABLE}.address`)
      .onUpdate('CASCADE')
      .onDelete('CASCADE')
      .nullable();
    table.string("asset_address")
      .index()
      .references(`${ASSET_TABLE}.address`)
      .onUpdate('CASCADE')
      .onDelete('CASCADE')
      .nullable();
    table.decimal("tvl", 16, 2).notNullable();
    table.string("meta").index().nullable();
    table.timestamp('timestamp').notNullable();
    table.string("network").index().notNullable();
    table.timestamps(true, true);
});

exports.down = knex => knex.schema.dropTable(TVL_LATEST_TABLE);