const { ASSET_TABLE } = require("../tables");

exports.up = (knex) => knex.schema.createTable(ASSET_TABLE, table => {
    table.increments();
    table.string("address").index().unique().notNullable();
    table.string("symbol").index().notNullable();
    table.string("decimals").notNullable();
    table.timestamps(true, true);
});

exports.down = knex => knex.schema.dropTable(ASSET_TABLE);