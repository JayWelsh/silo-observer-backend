const {
    SILO_TABLE,
    ASSET_TABLE,
} = require("../tables");

exports.up = (knex) => knex.schema.createTable(SILO_TABLE, table => {
    table.increments();
    table.string("name").index().notNullable();
    table.string("address").index().unique().notNullable();
    table.string("input_token_address").index().unique().references(`${ASSET_TABLE}.address`).notNullable();
    table.timestamps(true, true);
});

exports.down = knex => knex.schema.dropTable(SILO_TABLE);