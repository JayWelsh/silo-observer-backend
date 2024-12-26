import { QueryBuilder } from "objection";

import { SiloRevenueSnapshotModel } from "../models";
import BaseRepository from "./BaseRepository";
import Pagination, { IPaginationRequest } from "../../utils/Pagination";
import { ITransformer } from "../../interfaces";

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
    networks: string[] | undefined,
    pagination: IPaginationRequest,
    transformer: ITransformer,
  ) {
    let tableName = this.model.tableName;
  
    const { perPage, page } = pagination;
  
    // Get latest snapshots in one query using a window function
    const results = await this.model.query()
      .with('latest_snapshots', (qb: any) => {
        qb.from(tableName)
          .select(
            'silo_address',
            'asset_address',
            'network',
            'amount_pending',
            'amount_pending_usd',
            'amount_harvested',
            'amount_harvested_usd',
            'asset_price_at_sync_time',
            'timestamp'
          )
          .where(function (this: QueryBuilder<SiloRevenueSnapshotModel>) {
            if(networks) {
              this.whereIn('network', networks);
            }
          })
          .whereIn(['asset_address', 'network', 'timestamp'], 
            this.model.query()
              .select('asset_address', 'network')
              .max('timestamp as timestamp')
              .groupBy('asset_address', 'network')
          );
      })
      .from('latest_snapshots')
      .leftJoin('asset', 'asset.address', 'latest_snapshots.asset_address')
      .leftJoin('silo', 'silo.address', 'latest_snapshots.silo_address')
      .select(
        'latest_snapshots.asset_address',
        'latest_snapshots.network',
        'latest_snapshots.amount_pending',
        'latest_snapshots.amount_pending_usd',
        'latest_snapshots.amount_harvested',
        'latest_snapshots.amount_harvested_usd',
        'latest_snapshots.asset_price_at_sync_time',
        'latest_snapshots.timestamp',
        'asset.symbol as asset_symbol',
        'silo.name as silo_name',
        'silo.address as silo_address',
      )
      .orderBy('amount_pending_usd', 'DESC')
      .page(page - 1, perPage);
  
    return this.parserResult(new Pagination(results, perPage, page), transformer);
  }

}

export default new SiloRevenueSnapshotRepository();