const { WITHDRAW_EVENT_TABLE } = require("../tables");

exports.up = async (knex) => {
  await knex.schema.alterTable(WITHDRAW_EVENT_TABLE, table => {
    table.integer("protocol_version");
    table.string("caller").index();
    table.string("receiver").index();
    table.string("owner").index();
    table.decimal("shares", 78, 0).nullable();
    table.decimal("assets", 78, 0).nullable();
  });

  await knex(WITHDRAW_EVENT_TABLE).update({ protocol_version: 1 });

  await knex.schema.alterTable(WITHDRAW_EVENT_TABLE, table => {
    table.integer("protocol_version").notNullable().alter();
    table.index(["protocol_version"]);
  });
};

exports.down = knex => {
  return knex.schema.alterTable(WITHDRAW_EVENT_TABLE, table => {
    table.dropColumn("protocol_version");
    table.dropColumn("caller");
    table.dropColumn("receiver");
    table.dropColumn("owner");
    table.dropColumn("shares");
    table.dropColumn("assets");
  });
};