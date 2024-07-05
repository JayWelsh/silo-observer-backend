const {
  ASSET_TABLE,
  MERKL_REWARD_ENTRY_TABLE,
} = require("../tables");

exports.up = (knex) => knex.schema.createTable(MERKL_REWARD_ENTRY_TABLE, table => {
  table.increments();
  table.string("reason").index();
  table.string("asset_address")
    .index()
    .notNullable()
  table.string("user_address")
    .index()
    .notNullable()
  table.specificType("campaign_tags", "TEXT[]")
    .index(null, 'GIN')
  table.string("campaign_id")
    .index()
    .notNullable()
  table.string("campaign_key_long")
    .index()
    .notNullable()
  table.decimal("amount", 78, 0)
    .notNullable()
  table.string("network").notNullable();
  table.timestamps(true, true);
});

exports.down = knex => knex.schema.dropTable(MERKL_REWARD_ENTRY_TABLE);