const { REWARD_EVENT_TABLE } = require("../tables");

exports.up = async (knex) => {
  await knex.schema.alterTable(REWARD_EVENT_TABLE, table => {
    table.integer("protocol_version");
  });

  await knex(REWARD_EVENT_TABLE).update({ protocol_version: 1 });

  await knex.schema.alterTable(REWARD_EVENT_TABLE, table => {
    table.integer("protocol_version").notNullable().alter();
    table.index(["protocol_version"]);
  });
};

exports.down = knex => {
  return knex.schema.alterTable(REWARD_EVENT_TABLE, table => {
    table.dropColumn("protocol_version");
  });
};