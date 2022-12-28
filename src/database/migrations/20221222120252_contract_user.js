const {
  SILO_USER_TABLE,
} = require("../tables");

exports.up = (knex) => knex.schema.createTable(SILO_USER_TABLE, table => {
  table.increments();
  table.string("address").index().unique().notNullable();
  table.integer("interaction_count").index().notNullable();
  table.timestamps(true, true);
});

exports.down = knex => knex.schema.dropTable(SILO_USER_TABLE);