import { QueryBuilder } from "objection";

import { RateModel } from "../models";
import BaseRepository from "./BaseRepository";
import Pagination, { IPaginationRequest } from "../../utils/Pagination";
import { ITransformer } from "../../interfaces";

abstract class RateBaseRepository extends BaseRepository {
  abstract getModel(): void;

  async getLatestRateByAssetOnSideInSilo(
    assetAddress: string,
    side: string,
    siloAddress: string,
    deploymentID: string,
  ) {

    let tableName = this.model.tableName;

    const result = await this.model.query()
    .withGraphJoined('asset')
    .withGraphJoined('silo')
    .where(function (this: QueryBuilder<RateModel>) {
      this.where('asset_address', assetAddress);
      this.where('side', side);
      this.where('silo_address', siloAddress);
      this.where(`${tableName}.deployment_id`, deploymentID);
    }).orderBy('timestamp', 'DESC').first();

    return this.parserResult(result);
  }

  async getOldestRateByAssetOnSideInSilo(
    assetAddress: string,
    deploymentID: string,
    side: string,
    siloAddress: string,
  ) {

    let tableName = this.model.tableName;

    const result = await this.model.query()
    .withGraphJoined('asset')
    .withGraphJoined('silo')
    .where(function (this: QueryBuilder<RateModel>) {
      this.where('asset_address', assetAddress);
      this.where('side', side);
      this.where('silo_address', siloAddress);
      this.where(`${tableName}.deployment_id`, deploymentID);
    }).orderBy('timestamp', 'ASC').first();

    return this.parserResult(result);
  }

  async getRatesByAssetAddress(
    assetAddress: string,
    deploymentID: string,
    side: string | undefined,
    pagination: IPaginationRequest,
    transformer: ITransformer,
  ) {

    let tableName = this.model.tableName;

    const { perPage, page } = pagination;

    const results = await this.model.query()
    .withGraphJoined('asset')
    .withGraphJoined('silo')
    .where(function (this: QueryBuilder<RateModel>) {
      this.where('asset_address', assetAddress);
      this.where(`${tableName}.deployment_id`, deploymentID);
      if(side) {
        this.where('side', side);
      }
    }).orderBy('timestamp', 'DESC').page(page - 1, perPage);

    return this.parserResult(new Pagination(results, perPage, page), transformer);
  }

  async getRatesByAssetSymbol(
    assetAddress: string,
    deploymentID: string,
    side: string | undefined,
    pagination: IPaginationRequest,
    transformer: ITransformer,
  ) {

    let tableName = this.model.tableName;

    const { perPage, page } = pagination;

    const results = await this.model.query()
    .withGraphJoined('asset')
    .withGraphJoined('silo')
    .where(function (this: QueryBuilder<RateModel>) {
      this.where('asset.symbol', assetAddress);
      if(side) {
        this.where('side', side);
      }
      this.where(`${tableName}.deployment_id`, deploymentID);
    }).orderBy('timestamp', 'DESC').page(page - 1, perPage);

    return this.parserResult(new Pagination(results, perPage, page), transformer);
  }

  async getRatesBySiloAddress(
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
    .where(function (this: QueryBuilder<RateModel>) {
      this.where('silo_address', siloAddress);
      this.where(`${tableName}.deployment_id`, deploymentID);
    }).orderBy('timestamp', 'DESC').page(page - 1, perPage);

    return this.parserResult(new Pagination(results, perPage, page), transformer);
  }

  async getRatesBySiloName(
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
    .where(function (this: QueryBuilder<RateModel>) {
      this.where('silo.name', siloName);
      this.where(`${tableName}.deployment_id`, deploymentID);
    }).orderBy('timestamp', 'DESC').page(page - 1, perPage);

    return this.parserResult(new Pagination(results, perPage, page), transformer);
  }

  async getRateRecordCountByAssetOnSideInSilo(
    assetAddress: string,
    deploymentID: string,
    side: string,
    siloAddress: string
  ) {

    let tableName = this.model.tableName;
    
    const result = await this.model.query().where(function (this: QueryBuilder<RateModel>) {
      this.where('asset_address', assetAddress);
      this.where('side', side);
      this.where('silo_address', siloAddress);
      this.where(`${tableName}.deployment_id`, deploymentID);
    }).count();

    return result?.[0]?.count ? result?.[0]?.count : 0;
  }
}

export default RateBaseRepository;