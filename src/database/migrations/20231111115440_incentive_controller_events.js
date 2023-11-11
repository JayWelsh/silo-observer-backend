const {
  ASSET_TABLE,
  REWARD_EVENT_TABLE,
} = require("../tables");

exports.up = (knex) => knex.schema.createTable(REWARD_EVENT_TABLE, table => {
  table.increments();
  table.string("event_name").index();
  table.string("asset_address")
    .index()
    .references(`${ASSET_TABLE}.address`)
    .onUpdate('CASCADE')
    .onDelete('CASCADE')
    .nullable();
  table.string("user_address")
    .index()
    .notNullable()
  table.string("incentive_controller_address")
    .index()
    .notNullable()
  table.decimal("amount", 78, 0)
    .notNullable()
  table.string("tx_hash")
    .notNullable()
  table.string("network").notNullable();
  table.string("deployment_id").index().notNullable()
  table.integer("block_number").index().notNullable();
  table.decimal("usd_value_at_event_time", 16, 2).nullable();
  table.integer("log_index").notNullable();
  table.integer("tx_index").notNullable();
  table.string("event_fingerprint").unique().index().notNullable();
  table.decimal("asset_price_at_event_time", 24, 8).nullable();
  table.timestamps(true, true);
});

exports.down = knex => knex.schema.dropTable(REWARD_EVENT_TABLE);