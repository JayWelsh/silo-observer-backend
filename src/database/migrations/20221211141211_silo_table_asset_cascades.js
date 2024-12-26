const {
  SILO_TABLE,
  ASSET_TABLE,
} = require("../tables");

exports.up = (knex) => knex.schema.alterTable(SILO_TABLE, table => {
    table.dropForeign("input_token_address")
    table.foreign("input_token_address")
      .references(`${ASSET_TABLE}.address`)
      .onUpdate('CASCADE')
      .onDelete('CASCADE')
});

exports.down = knex => {};