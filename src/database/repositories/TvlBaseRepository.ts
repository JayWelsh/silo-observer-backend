import { QueryBuilder } from "objection";

import { TvlHourlyModel } from "../models";
import BaseRepository from "./BaseRepository";
import Pagination, { IPaginationRequest } from "../../utils/Pagination";
import { ITransformer } from "../../interfaces";

abstract class TvlBaseRepository extends BaseRepository {
  abstract getModel(): void;

  async getLatestTvlTotalByAssetInSilo(
    assetAddress: string,
    deploymentID: string,
    siloAddress: string,
  ) {
    
    let tableName = this.model.tableName;

    const result = await this.model.query()
    .withGraphJoined('asset')
    .withGraphJoined('silo')
    .where(function (this: QueryBuilder<TvlHourlyModel>) {
      this.where('asset_address', assetAddress);
      this.where('silo_address', siloAddress);
      this.where(`${tableName}.deployment_id`, deploymentID);
    }).orderBy('timestamp', 'DESC').first();

    return this.parserResult(result);
  }

  async getTvlTotalsByAssetAddress(
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
    .where(function (this: QueryBuilder<TvlHourlyModel>) {
      this.where('asset_address', assetAddress);
      this.where(`${tableName}.deployment_id`, deploymentID);
      this.where(`silo.deployment_id`, deploymentID);
    }).orderBy('timestamp', 'DESC').page(page - 1, perPage);

    return this.parserResult(new Pagination(results, perPage, page), transformer);
  }

  async getTvlTotalsByAssetSymbol(
    assetSymbol: string,
    deploymentID: string,
    pagination: IPaginationRequest,
    transformer: ITransformer,
  ) {

    let tableName = this.model.tableName;

    const { perPage, page } = pagination;

    const results = await this.model.query()
    .withGraphJoined('asset')
    .withGraphJoined('silo')
    .where(function (this: QueryBuilder<TvlHourlyModel>) {
      this.where('asset.symbol', assetSymbol);
      this.where(`${tableName}.deployment_id`, deploymentID);
      this.where(`silo.deployment_id`, deploymentID);
    }).orderBy('timestamp', 'DESC').page(page - 1, perPage);

    return this.parserResult(new Pagination(results, perPage, page), transformer);
  }

  async getTvlTotalsBySiloAddress(
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
    .where(function (this: QueryBuilder<TvlHourlyModel>) {
      this.where('silo_address', siloAddress);
      this.where(`${tableName}.deployment_id`, deploymentID);
      this.where(`silo.deployment_id`, deploymentID);
    }).orderBy('timestamp', 'DESC').page(page - 1, perPage);

    return this.parserResult(new Pagination(results, perPage, page), transformer);
  }

  async getTvlTotalsBySiloName(
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
    .where(function (this: QueryBuilder<TvlHourlyModel>) {
      this.where('silo.name', siloName);
      this.where(`${tableName}.deployment_id`, deploymentID);
      this.where(`silo.deployment_id`, deploymentID);
    }).orderBy('timestamp', 'DESC').page(page - 1, perPage);

    return this.parserResult(new Pagination(results, perPage, page), transformer);
  }

  async getTvlTotalsWholePlatform(
    pagination: IPaginationRequest,
    networks: string[] | undefined,
    versions: string[] | undefined,
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
    .where(function (this: QueryBuilder<TvlHourlyModel>) {
      this.where('silo_address', null);
      this.where('asset_address', null);
      this.where('meta', 'all');
    })
    .where(function (this: QueryBuilder<TvlHourlyModel>) {
      if(networks) {
        this.whereIn(`${tableName}.network`, networks);
      }
      if(versions) {
        this.whereIn(`${tableName}.protocol_version`, versions);
      }
    })
    .orderBy('timestamp', 'DESC').page(page - 1, perPage);

    return this.parserResult(new Pagination(results, perPage, page), transformer);
  }
}

export default TvlBaseRepository;