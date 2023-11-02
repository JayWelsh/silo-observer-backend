const {
  EVENT_INDEXER_BLOCK_TRACKER_TABLE,
} = require("../tables");

exports.up = async (knex) => {
  await knex(EVENT_INDEXER_BLOCK_TRACKER_TABLE).where({ network: "arbitrum" }).update('last_checked_block', 0);
  await knex(EVENT_INDEXER_BLOCK_TRACKER_TABLE).where({ network: "ethereum" }).update('last_checked_block', 0);
}

exports.down = async (knex) => {
  await knex(EVENT_INDEXER_BLOCK_TRACKER_TABLE).where({ network: "ethereum" }).update('last_checked_block', 0);
  await knex(EVENT_INDEXER_BLOCK_TRACKER_TABLE).where({ network: "arbitrum" }).update('last_checked_block', 0);
}