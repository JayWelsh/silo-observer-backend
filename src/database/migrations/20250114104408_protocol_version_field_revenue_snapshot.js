const { SILO_REVENUE_SNAPSHOT_TABLE } = require("../tables");

exports.up = async (knex) => {
  await knex.schema.alterTable(SILO_REVENUE_SNAPSHOT_TABLE, table => {
    table.integer("protocol_version");
    table.decimal("amount_pending_deployer", 21, 13).nullable();
    table.decimal("amount_pending_deployer_usd", 21, 13).nullable();
    table.decimal("amount_pending_deployer_raw", 78, 0).nullable();
  });

  await knex(SILO_REVENUE_SNAPSHOT_TABLE).update({ protocol_version: 1 });

  await knex.schema.alterTable(SILO_REVENUE_SNAPSHOT_TABLE, table => {
    table.integer("protocol_version").notNullable().alter();
    table.index(["protocol_version"]);
  });
};

exports.down = knex => {
  return knex.schema.alterTable(SILO_REVENUE_SNAPSHOT_TABLE, table => {
    table.dropColumn("protocol_version");
  });
};