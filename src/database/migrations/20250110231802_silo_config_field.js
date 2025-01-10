const { SILO_TABLE } = require("../tables");

exports.up = async (knex) => {
  await knex.schema.alterTable(SILO_TABLE, table => {
    table.string("silo_config_v2", 42).index();
  });
};

exports.down = knex => {
  return knex.schema.alterTable(SILO_TABLE, table => {
    table.dropColumn("silo_config_v2");
  });
};