const { 
  SILO_REVENUE_SNAPSHOT_TABLE,
  SILO_TABLE,
  ASSET_TABLE,
} = require("../tables");

exports.up = (knex) => knex.schema.createTable(SILO_REVENUE_SNAPSHOT_TABLE, table => {
    // Primary key
    table.increments();
    
    // Foreign key columns
    table.string("silo_address").index().notNullable();
    table.string("asset_address").index().notNullable();
    table.string("network").index().notNullable();
    table.string("deployment_id").index().notNullable();
    
    // Regular columns
    table.decimal("amount_pending", 21, 13).notNullable();
    table.decimal("amount_pending_usd", 21, 13).notNullable();
    table.decimal("amount_pending_raw", 78, 0).notNullable();
    table.decimal("amount_harvested", 21, 13).notNullable();
    table.decimal("amount_harvested_usd", 21, 13).notNullable();
    table.decimal("amount_harvested_raw", 78, 0).notNullable();
    table.decimal("asset_price_at_sync_time", 21, 13).notNullable();
    table.timestamp('timestamp').notNullable();
    
    // Timestamps
    table.timestamps(true, true);
    
    // Foreign key constraints
    table.foreign("asset_address")
      .references(`${ASSET_TABLE}.address`)
      .onUpdate('CASCADE')
      .onDelete('CASCADE');
      
    // Composite foreign key
    table.foreign(["silo_address", "network"])
      .references([`${SILO_TABLE}.address`, `${SILO_TABLE}.network`]);
});

exports.down = (knex) => knex.schema.dropTable(SILO_REVENUE_SNAPSHOT_TABLE);