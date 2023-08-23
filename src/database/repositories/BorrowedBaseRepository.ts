import { QueryBuilder } from "objection";

import { BorrowedMinutelyModel } from "../models";
import BaseRepository from "./BaseRepository";
import Pagination, { IPaginationRequest } from "../../utils/Pagination";
import { ITransformer } from "../../interfaces";

abstract class BorrowedBaseRepository extends BaseRepository {
  abstract getModel(): void;

  async getLatestBorrowedTotalByAssetInSilo(
    assetAddress: string,
    deploymentID: string,
    siloAddress: string,
  ) {
    let tableName = this.model.tableName;
    const result = await this.model.query()
    .withGraphJoined('asset')
    .withGraphJoined('silo')
    .where(function (this: QueryBuilder<BorrowedMinutelyModel>) {
      this.where('asset_address', assetAddress);
      this.where('silo_address', siloAddress);
      this.where(`${tableName}.deployment_id`, deploymentID);
    }).orderBy('timestamp', 'DESC').first();

    return this.parserResult(result);
  }

  async getBorrowedTotalsByAssetAddress(
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
    .where(function (this: QueryBuilder<BorrowedMinutelyModel>) {
      this.where('asset_address', assetAddress);
      this.where(`${tableName}.deployment_id`, deploymentID);
    }).orderBy('timestamp', 'DESC').page(page - 1, perPage);

    return this.parserResult(new Pagination(results, perPage, page), transformer);
  }

  async getBorrowedTotalsByAssetSymbol(
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
    .where(function (this: QueryBuilder<BorrowedMinutelyModel>) {
      this.where('asset.symbol', assetSymbol);
      this.where(`${tableName}.deployment_id`, deploymentID);
    }).orderBy('timestamp', 'DESC').page(page - 1, perPage);

    return this.parserResult(new Pagination(results, perPage, page), transformer);
  }

  async getBorrowedTotalsBySiloAddress(
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
    .where(function (this: QueryBuilder<BorrowedMinutelyModel>) {
      this.where('silo_address', siloAddress);
      this.where(`${tableName}.deployment_id`, deploymentID);
    }).orderBy('timestamp', 'DESC').page(page - 1, perPage);

    return this.parserResult(new Pagination(results, perPage, page), transformer);
  }

  async getBorrowedTotalsBySiloName(
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
    .where(function (this: QueryBuilder<BorrowedMinutelyModel>) {
      this.where('silo.name', siloName);
      this.where(`${tableName}.deployment_id`, deploymentID);
    }).orderBy('timestamp', 'DESC').page(page - 1, perPage);

    return this.parserResult(new Pagination(results, perPage, page), transformer);
  }

  async getBorrowedTotalsWholePlatform(
    pagination: IPaginationRequest,
    transformer: ITransformer,
  ) {

    const { 
      perPage,
      page
    } = pagination;

    const results = await this.model.query()
    .withGraphJoined('silo')
    .withGraphJoined('asset')
    .where(function (this: QueryBuilder<BorrowedMinutelyModel>) {
      this.where('silo_address', null);
      this.where('asset_address', null);
      this.where('meta', 'all');
    }).orderBy('timestamp', 'DESC').page(page - 1, perPage);

    return this.parserResult(new Pagination(results, perPage, page), transformer);
  }
}

export default BorrowedBaseRepository;