const { NEW_SILO_EVENT_TABLE } = require("../tables");

exports.up = async (knex) => {
  await knex.schema.createTable(NEW_SILO_EVENT_TABLE, table => {
    table.increments();
    table.integer("protocol_version").index();
    table.string("silo_factory").index();
    table.string("implementation").index();
    table.string("token0").index();
    table.string("token1").index();
    table.string("silo").index();
    table.string("asset").index();
    table.string("version").index();
    table.string("silo0").index();
    table.string("silo1").index();
    table.string("silo_config").index();
    table.string("deployer").index();
    table.string("tx_hash").notNullable()
    table.integer("block_number").index().notNullable();
    table.string("event_fingerprint").unique().index().notNullable();
    table.integer("log_index").notNullable();
    table.integer("tx_index").notNullable();
    table.string("deployment_id").index().notNullable();
    table.string("network").index().notNullable();
  });
};

exports.down = knex => {
  return knex.schema.dropTable(NEW_SILO_EVENT_TABLE);
};