const {
  SILO_TABLE,
  ASSET_TABLE,
  RATE_LATEST_TABLE,
} = require("../tables");

exports.up = (knex) => knex.schema.createTable(RATE_LATEST_TABLE, table => {
    table.increments();
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
      .notNullable();
    table.decimal("rate", 16, 13).notNullable();
    table.string("side").index().notNullable();
    table.string("type").index().notNullable();
    table.timestamp('timestamp').notNullable();
    table.timestamps(true, true);
});

exports.down = knex => knex.schema.dropTable(RATE_LATEST_TABLE);