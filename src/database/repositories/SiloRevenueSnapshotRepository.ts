import { QueryBuilder } from "objection";

import { SiloRevenueSnapshotModel } from "../models";
import BaseRepository from "./BaseRepository";
import Pagination, { IPaginationRequest } from "../../utils/Pagination";
import { ITransformer } from "../../interfaces";
import {
  LATEST_SILO_REVENUE_SNAPSHOT_MATERIALIZED_VIEW,
  HOURLY_SILO_REVENUE_SNAPSHOT_TIMESERIES_BY_NETWORK_MATERIALIZED_VIEW,
  HOURLY_SILO_REVENUE_SNAPSHOT_TIMESERIES_BY_NETWORK_EXCL_XAI_MATERIALIZED_VIEW,
  DAILY_SILO_REVENUE_DELTA_BY_NETWORK_MATERIALIZED_VIEW,
} from '../../database/tables';

class SiloRevenueSnapshotRepository extends BaseRepository {
  getModel() {
    return SiloRevenueSnapshotModel
  }

  async getLatestSnapshotByAssetInSilo(
    assetAddress: string,
    siloAddress: string,
    deploymentID: string,
  ) {

    let tableName = this.model.tableName;

    const result = await this.model.query()
    .withGraphJoined('asset')
    .withGraphJoined('silo')
    .where(function (this: QueryBuilder<SiloRevenueSnapshotModel>) {
      this.where('asset_address', assetAddress);
      this.where('silo_address', siloAddress);
      this.where(`${tableName}.deployment_id`, deploymentID);
    }).orderBy('timestamp', 'DESC').first();

    return this.parserResult(result);
  }

  async getOldestSnapshotByAssetInSilo(
    assetAddress: string,
    deploymentID: string,
    siloAddress: string,
  ) {

    let tableName = this.model.tableName;

    const result = await this.model.query()
    .withGraphJoined('asset')
    .withGraphJoined('silo')
    .where(function (this: QueryBuilder<SiloRevenueSnapshotModel>) {
      this.where('asset_address', assetAddress);
      this.where('silo_address', siloAddress);
      this.where(`${tableName}.deployment_id`, deploymentID);
    }).orderBy('timestamp', 'ASC').first();

    return this.parserResult(result);
  }

  async getSnapshotsByAssetAddress(
    assetAddress: string,
    deploymentID: string,
    pagination: IPaginationRequest,
    transformer: ITransformer,
  ) {

    let tableName = this.model.tableName;

    const { perPage, page } = pagination;

    const results = await this.model.query()
    .withGraphJoined('asset')
    .withGraphJoined('silo')
    .where(function (this: QueryBuilder<SiloRevenueSnapshotModel>) {
      this.where('asset_address', assetAddress);
      this.where(`${tableName}.deployment_id`, deploymentID);
    }).orderBy('timestamp', 'DESC').page(page - 1, perPage);

    return this.parserResult(new Pagination(results, perPage, page), transformer);
  }

  async getSnapshotsByAssetSymbol(
    assetAddress: string,
    deploymentID: string,
    pagination: IPaginationRequest,
    transformer: ITransformer,
  ) {

    let tableName = this.model.tableName;

    const { perPage, page } = pagination;

    const results = await this.model.query()
    .withGraphJoined('asset')
    .withGraphJoined('silo')
    .where(function (this: QueryBuilder<SiloRevenueSnapshotModel>) {
      this.where('asset.symbol', assetAddress);
      this.where(`${tableName}.deployment_id`, deploymentID);
    }).orderBy('timestamp', 'DESC').page(page - 1, perPage);

    return this.parserResult(new Pagination(results, perPage, page), transformer);
  }

  async getSnapshotsBySiloAddress(
    siloAddress: string,
    deploymentID: string,
    pagination: IPaginationRequest,
    transformer: ITransformer,
  ) {

    let tableName = this.model.tableName;

    const { 
      perPage,
      page
    } = pagination;

    const results = await this.model.query()
    .withGraphJoined('silo')
    .withGraphJoined('asset')
    .where(function (this: QueryBuilder<SiloRevenueSnapshotModel>) {
      this.where('silo_address', siloAddress);
      this.where(`${tableName}.deployment_id`, deploymentID);
    }).orderBy('timestamp', 'DESC').page(page - 1, perPage);

    return this.parserResult(new Pagination(results, perPage, page), transformer);
  }

  async getSnapshotsBySiloName(
    siloName: string,
    deploymentID: string,
    pagination: IPaginationRequest,
    transformer: ITransformer,
  ) {

    let tableName = this.model.tableName;

    const { 
      perPage,
      page
    } = pagination;

    const results = await this.model.query()
    .withGraphJoined('silo')
    .withGraphJoined('asset')
    .where(function (this: QueryBuilder<SiloRevenueSnapshotModel>) {
      this.where('silo.name', siloName);
      this.where(`${tableName}.deployment_id`, deploymentID);
    }).orderBy('timestamp', 'DESC').page(page - 1, perPage);

    return this.parserResult(new Pagination(results, perPage, page), transformer);
  }

  async getLatestSnapshots(
    networks: string | string[] | undefined,
    pagination: IPaginationRequest,
    transformer: ITransformer,
  ) {
    const { perPage, page } = pagination;
    
    // Convert networks to array as it's a comma-separated string
    const networksArray = typeof networks === 'string' 
      ? networks.split(',')
      : networks;

    const results = await this.model.query()
      .from(LATEST_SILO_REVENUE_SNAPSHOT_MATERIALIZED_VIEW)
      .modify((queryBuilder: QueryBuilder<SiloRevenueSnapshotModel>) => {
          if (networksArray) {
              queryBuilder.whereIn('network', networksArray);
          }
      })
      .select(
          'asset_address',
          'network',
          'amount_pending',
          'amount_pending_usd',
          'amount_harvested',
          'amount_harvested_usd',
          'asset_price_at_sync_time',
          'timestamp',
          'deployment_id',
          'asset_symbol',
          'silo_name',
          'silo_address'
      )
      .orderBy('amount_pending_usd', 'DESC')
      .page(page - 1, perPage);

    return this.parserResult(new Pagination(results, perPage, page), transformer);
  }

  async getTimeseriesDistinctNetworks(
    networks: string | string[] | undefined,
    pagination: IPaginationRequest,
    excludeXAI: boolean,
    transformer: ITransformer,
  ) {
    const { perPage, page } = pagination;
    
    // Convert networks to array as it's a comma-separated string
    const networksArray = typeof networks === 'string' 
      ? networks.split(',')
      : networks;

    let materializedViewToUse = excludeXAI ? HOURLY_SILO_REVENUE_SNAPSHOT_TIMESERIES_BY_NETWORK_EXCL_XAI_MATERIALIZED_VIEW : HOURLY_SILO_REVENUE_SNAPSHOT_TIMESERIES_BY_NETWORK_MATERIALIZED_VIEW;

    const results = await this.model.query()
      .from(materializedViewToUse)
      .modify((queryBuilder: QueryBuilder<SiloRevenueSnapshotModel>) => {
          if (networksArray) {
              queryBuilder.whereIn('network', networksArray);
          }
      })
      .select(
          'network',
          'amount_pending_usd',
          'amount_harvested_usd',
          'hour_timestamp as timestamp',
      )
      .orderBy('timestamp', 'DESC')
      .page(page - 1, perPage);

    return this.parserResult(new Pagination(results, perPage, page), transformer);
  }

  async getTimeseriesDistinctTimestamps(
    networks: string | string[] | undefined,
    pagination: IPaginationRequest,
    excludeXAI: boolean,
    transformer: ITransformer,
  ) {
    const { perPage, page } = pagination;
    
    // Convert networks to array as it's a comma-separated string
    const networksArray = typeof networks === 'string' 
        ? networks.split(',')
        : networks;

    let materializedViewToUse = excludeXAI ? HOURLY_SILO_REVENUE_SNAPSHOT_TIMESERIES_BY_NETWORK_EXCL_XAI_MATERIALIZED_VIEW : HOURLY_SILO_REVENUE_SNAPSHOT_TIMESERIES_BY_NETWORK_MATERIALIZED_VIEW;

    const results = await this.model.query()
        .from(materializedViewToUse)
        .modify((queryBuilder: QueryBuilder<SiloRevenueSnapshotModel>) => {
            if (networksArray) {
                queryBuilder.whereIn('network', networksArray);
            }
        })
        .select(
            'hour_timestamp as timestamp',
            this.model.knex().raw('SUM(amount_pending_usd) as amount_pending_usd'),
            this.model.knex().raw('SUM(amount_harvested_usd) as amount_harvested_usd')
        )
        .groupBy('hour_timestamp')
        .orderBy('timestamp', 'DESC')
        .page(page - 1, perPage);

    return this.parserResult(new Pagination(results, perPage, page), transformer);
  }

  async getDailySiloUnclaimedFeeDelta(
    networks: string | string[] | undefined,
    transformer: ITransformer,
  ) {
    
    // Convert networks to array as it's a comma-separated string
    const networksArray = typeof networks === 'string' 
      ? networks.split(',')
      : networks;

    let materializedViewToUse = DAILY_SILO_REVENUE_DELTA_BY_NETWORK_MATERIALIZED_VIEW;

    const results = await this.model.query()
      .from(materializedViewToUse)
      .modify((queryBuilder: QueryBuilder<SiloRevenueSnapshotModel>) => {
          if (networksArray) {
              queryBuilder.whereIn('network', networksArray);
          }
      })
      .select(
          'network',
          'pending_usd_delta',
          'harvested_usd_delta',
      )

    return this.parserResult(results, transformer);
  }

  async refreshLatestRevenueSnapshotMaterializedView(): Promise<void> {
    try {
      console.time(`refresh_${LATEST_SILO_REVENUE_SNAPSHOT_MATERIALIZED_VIEW}`);
      await this.model.knex().raw(`REFRESH MATERIALIZED VIEW CONCURRENTLY ${LATEST_SILO_REVENUE_SNAPSHOT_MATERIALIZED_VIEW}`);
      console.timeEnd(`refresh_${LATEST_SILO_REVENUE_SNAPSHOT_MATERIALIZED_VIEW}`);
    } catch (error) {
      console.error('Failed to refresh materialized view:', error);
      throw error;
    }
  }

  async refreshLatestRevenueSnapshotTimeseriesByNetworkMaterializedView(): Promise<void> {
    try {
      console.time(`refresh_${HOURLY_SILO_REVENUE_SNAPSHOT_TIMESERIES_BY_NETWORK_MATERIALIZED_VIEW}`);
      await this.model.knex().raw(`REFRESH MATERIALIZED VIEW CONCURRENTLY ${HOURLY_SILO_REVENUE_SNAPSHOT_TIMESERIES_BY_NETWORK_MATERIALIZED_VIEW}`);
      console.timeEnd(`refresh_${HOURLY_SILO_REVENUE_SNAPSHOT_TIMESERIES_BY_NETWORK_MATERIALIZED_VIEW}`);
    } catch (error) {
      console.error(`Failed to refresh ${HOURLY_SILO_REVENUE_SNAPSHOT_TIMESERIES_BY_NETWORK_MATERIALIZED_VIEW} materialized view:`, error);
      throw error;
    }
  }

  async refreshLatestRevenueSnapshotTimeseriesByNetworkExcludeXAIMaterializedView(): Promise<void> {
    try {
      console.time(`refresh_${HOURLY_SILO_REVENUE_SNAPSHOT_TIMESERIES_BY_NETWORK_EXCL_XAI_MATERIALIZED_VIEW}`);
      await this.model.knex().raw(`REFRESH MATERIALIZED VIEW CONCURRENTLY ${HOURLY_SILO_REVENUE_SNAPSHOT_TIMESERIES_BY_NETWORK_EXCL_XAI_MATERIALIZED_VIEW}`);
      console.timeEnd(`refresh_${HOURLY_SILO_REVENUE_SNAPSHOT_TIMESERIES_BY_NETWORK_EXCL_XAI_MATERIALIZED_VIEW}`);
    } catch (error) {
      console.error(`Failed to refresh ${HOURLY_SILO_REVENUE_SNAPSHOT_TIMESERIES_BY_NETWORK_EXCL_XAI_MATERIALIZED_VIEW} materialized view:`, error);
      throw error;
    }
  }

  async refreshDailyRevenueDeltaByNetworkMaterializedView(): Promise<void> {
    try {
      console.time(`refresh_${DAILY_SILO_REVENUE_DELTA_BY_NETWORK_MATERIALIZED_VIEW}`);
      await this.model.knex().raw(`REFRESH MATERIALIZED VIEW CONCURRENTLY ${DAILY_SILO_REVENUE_DELTA_BY_NETWORK_MATERIALIZED_VIEW}`);
      console.timeEnd(`refresh_${DAILY_SILO_REVENUE_DELTA_BY_NETWORK_MATERIALIZED_VIEW}`);
    } catch (error) {
      console.error(`Failed to refresh ${DAILY_SILO_REVENUE_DELTA_BY_NETWORK_MATERIALIZED_VIEW} materialized view:`, error);
      throw error;
    }
  }

}

export default new SiloRevenueSnapshotRepository();