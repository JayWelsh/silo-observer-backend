const { TVL_HOURLY_TABLE } = require("../tables");

exports.up = async (knex) => {
  await knex.schema.alterTable(TVL_HOURLY_TABLE, table => {
    table.integer("protocol_version");
  });

  await knex(TVL_HOURLY_TABLE).update({ protocol_version: 1 });

  await knex.schema.alterTable(TVL_HOURLY_TABLE, table => {
    table.integer("protocol_version").notNullable().alter();
    table.index(["protocol_version"]);
  });
};

exports.down = knex => {
  return knex.schema.alterTable(TVL_HOURLY_TABLE, table => {
    table.dropColumn("protocol_version");
  });
};