const { SILO_TABLE } = require("../tables");

exports.up = async (knex) => {
  await knex.schema.alterTable("rate", (table) => {
    table.dropForeign(["silo_address"]);
    table.foreign(["silo_address", "network"]).references([`${SILO_TABLE}.address`, `${SILO_TABLE}.network`]);
  });
  await knex.schema.alterTable("tvl_minutely", (table) => {
    table.dropForeign(["silo_address"]);
    table.foreign(["silo_address", "network"]).references([`${SILO_TABLE}.address`, `${SILO_TABLE}.network`]);
  });
  await knex.schema.alterTable("tvl_hourly", (table) => {
    table.dropForeign(["silo_address"]);
    table.foreign(["silo_address", "network"]).references([`${SILO_TABLE}.address`, `${SILO_TABLE}.network`]);
  });
  await knex.schema.alterTable("borrowed_minutely", (table) => {
    table.dropForeign(["silo_address"]);
    table.foreign(["silo_address", "network"]).references([`${SILO_TABLE}.address`, `${SILO_TABLE}.network`]);
  });
  await knex.schema.alterTable("borrowed_hourly", (table) => {
    table.dropForeign(["silo_address"]);
    table.foreign(["silo_address", "network"]).references([`${SILO_TABLE}.address`, `${SILO_TABLE}.network`]);
  });
  await knex.schema.alterTable("rate_hourly", (table) => {
    table.dropForeign(["silo_address"]);
    table.foreign(["silo_address", "network"]).references([`${SILO_TABLE}.address`, `${SILO_TABLE}.network`]);
  });
  await knex.schema.alterTable("rate_latest", (table) => {
    table.dropForeign(["silo_address"]);
    table.foreign(["silo_address", "network"]).references([`${SILO_TABLE}.address`, `${SILO_TABLE}.network`]);
  });
  await knex.schema.alterTable("borrow_event", (table) => {
    table.dropForeign(["silo_address"]);
    table.foreign(["silo_address", "network"]).references([`${SILO_TABLE}.address`, `${SILO_TABLE}.network`]);
  });
  await knex.schema.alterTable("repay_event", (table) => {
    table.dropForeign(["silo_address"]);
    table.foreign(["silo_address", "network"]).references([`${SILO_TABLE}.address`, `${SILO_TABLE}.network`]);
  });
  await knex.schema.alterTable("deposit_event", (table) => {
    table.dropForeign(["silo_address"]);
    table.foreign(["silo_address", "network"]).references([`${SILO_TABLE}.address`, `${SILO_TABLE}.network`]);
  });
  await knex.schema.alterTable("withdraw_event", (table) => {
    table.dropForeign(["silo_address"]);
    table.foreign(["silo_address", "network"]).references([`${SILO_TABLE}.address`, `${SILO_TABLE}.network`]);
  });
  await knex.schema.alterTable("tvl_latest", (table) => {
    table.dropForeign(["silo_address"]);
    table.foreign(["silo_address", "network"]).references([`${SILO_TABLE}.address`, `${SILO_TABLE}.network`]);
  });
  await knex.schema.alterTable("borrowed_latest", (table) => {
    table.dropForeign(["silo_address"]);
    table.foreign(["silo_address", "network"]).references([`${SILO_TABLE}.address`, `${SILO_TABLE}.network`]);
  });
  await knex.schema.alterTable("subgraph_liquidation_record", (table) => {
    table.dropForeign(["silo_address"]);
    table.foreign(["silo_address", "network"]).references([`${SILO_TABLE}.address`, `${SILO_TABLE}.network`]);
  });

  await knex.schema.alterTable(SILO_TABLE, (table) => {
    table.dropUnique(["address"]);
    table.unique(["address", "network"]);
  });
};

exports.down = async (knex) => {
  await knex.schema.alterTable(SILO_TABLE, (table) => {
    table.dropUnique(["address", "network"]);
    table.unique(["address"]);
  });

  await knex.schema.alterTable("rate", (table) => {
    table.dropForeign(["silo_address", "network"]);
    table.foreign("silo_address").references(`${SILO_TABLE}.address`);
  });
  await knex.schema.alterTable("tvl_minutely", (table) => {
    table.dropForeign(["silo_address", "network"]);
    table.foreign("silo_address").references(`${SILO_TABLE}.address`);
  });
  await knex.schema.alterTable("tvl_hourly", (table) => {
    table.dropForeign(["silo_address", "network"]);
    table.foreign("silo_address").references(`${SILO_TABLE}.address`);
  });
  await knex.schema.alterTable("borrowed_minutely", (table) => {
    table.dropForeign(["silo_address", "network"]);
    table.foreign("silo_address").references(`${SILO_TABLE}.address`);
  });
  await knex.schema.alterTable("borrowed_hourly", (table) => {
    table.dropForeign(["silo_address", "network"]);
    table.foreign("silo_address").references(`${SILO_TABLE}.address`);
  });
  await knex.schema.alterTable("rate_hourly", (table) => {
    table.dropForeign(["silo_address", "network"]);
    table.foreign("silo_address").references(`${SILO_TABLE}.address`);
  });
  await knex.schema.alterTable("rate_latest", (table) => {
    table.dropForeign(["silo_address", "network"]);
    table.foreign("silo_address").references(`${SILO_TABLE}.address`);
  });
  await knex.schema.alterTable("borrow_event", (table) => {
    table.dropForeign(["silo_address", "network"]);
    table.foreign("silo_address").references(`${SILO_TABLE}.address`);
  });
  await knex.schema.alterTable("repay_event", (table) => {
    table.dropForeign(["silo_address", "network"]);
    table.foreign("silo_address").references(`${SILO_TABLE}.address`);
  });
  await knex.schema.alterTable("deposit_event", (table) => {
    table.dropForeign(["silo_address", "network"]);
    table.foreign("silo_address").references(`${SILO_TABLE}.address`);
  });
  await knex.schema.alterTable("withdraw_event", (table) => {
    table.dropForeign(["silo_address", "network"]);
    table.foreign("silo_address").references(`${SILO_TABLE}.address`);
  });
  await knex.schema.alterTable("tvl_latest", (table) => {
    table.dropForeign(["silo_address", "network"]);
    table.foreign("silo_address").references(`${SILO_TABLE}.address`);
  });
  await knex.schema.alterTable("borrowed_latest", (table) => {
    table.dropForeign(["silo_address", "network"]);
    table.foreign("silo_address").references(`${SILO_TABLE}.address`);
  });
  await knex.schema.alterTable("subgraph_liquidation_record", (table) => {
    table.dropForeign(["silo_address", "network"]);
    table.foreign("silo_address").references(`${SILO_TABLE}.address`);
  });
};