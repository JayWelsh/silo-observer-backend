const {
  BLOCK_METADATA_TABLE,
} = require("../tables");

exports.up = (knex) => knex.schema.alterTable(BLOCK_METADATA_TABLE, async (table) => {
  await knex(BLOCK_METADATA_TABLE).truncate();
}).then(() => knex.schema.alterTable(BLOCK_METADATA_TABLE, table => {
  table.string("block_hash").index().notNullable();
}))

exports.down = (knex) => knex.schema.alterTable(BLOCK_METADATA_TABLE, table => {
  table.dropColumn("block_hash");
});