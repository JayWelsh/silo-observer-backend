const {
  SILO_TABLE,
  ASSET_TABLE,
  BORROW_EVENT_TABLE,
  SILO_USER_TABLE,
} = require("../tables");

exports.up = (knex) => knex.schema.createTable(BORROW_EVENT_TABLE, table => {
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
    .nullable();
  table.string("user_address")
    .index()
    .notNullable()
  table.decimal("amount", 78, 0)
    .notNullable()
  table.string("tx_hash")
    .notNullable()
  table.integer("block_number").index().notNullable();
  table.timestamps(true, true);
});

exports.down = knex => knex.schema.dropTable(BORROW_EVENT_TABLE);