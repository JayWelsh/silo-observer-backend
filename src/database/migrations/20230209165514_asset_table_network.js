const {
  ASSET_TABLE,
} = require("../tables");

exports.up = (knex) => knex.schema.alterTable(ASSET_TABLE, table => {
  table.string("network").index().defaultTo("ethereum").notNullable();
});

exports.down = (knex) => knex.schema.alterTable(ASSET_TABLE, table => {
  table.dropColumn("network");
});