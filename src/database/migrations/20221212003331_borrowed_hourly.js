const {
  SILO_TABLE,
  ASSET_TABLE,
  BORROWED_HOURLY_TABLE,
} = require("../tables");

exports.up = (knex) => knex.schema.createTable(BORROWED_HOURLY_TABLE, table => {
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
    table.decimal("borrowed", 16, 2).notNullable();
    table.string("meta").index().nullable();
    table.timestamp('timestamp').notNullable();
    table.timestamps(true, true);
});

exports.down = knex => knex.schema.dropTable(BORROWED_HOURLY_TABLE);