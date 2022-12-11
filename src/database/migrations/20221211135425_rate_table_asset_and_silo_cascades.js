const {
  SILO_TABLE,
  ASSET_TABLE,
  RATE_TABLE,
} = require("../tables");

exports.up = (knex) => knex.schema.alterTable(RATE_TABLE, table => {
    table.dropForeign("silo_address")
    table.dropForeign("asset_address")
    table.foreign('silo_address')
      .references(`${SILO_TABLE}.address`)
      .onUpdate('CASCADE')
      .onDelete('CASCADE')
    table.foreign("asset_address")
      .references(`${ASSET_TABLE}.address`)
      .onUpdate('CASCADE')
      .onDelete('CASCADE')
});

exports.down = knex => {};