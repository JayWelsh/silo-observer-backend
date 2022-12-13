import { QueryBuilder } from "objection";

import { TvlHourlyModel } from "../models";
import BaseRepository from "./BaseRepository";
import Pagination, { IPaginationRequest } from "../../utils/Pagination";
import { ITransformer } from "../../interfaces";

abstract class TvlBaseRepository extends BaseRepository {
  abstract getModel(): void;

  async getLatestTvlTotalByAssetInSilo(
    assetAddress: string,
    siloAddress: string,
  ) {
    const result = await this.model.query()
    .withGraphJoined('asset')
    .withGraphJoined('silo')
    .where(function (this: QueryBuilder<TvlHourlyModel>) {
      this.where('asset_address', assetAddress);
      this.where('silo_address', siloAddress);
    }).orderBy('timestamp', 'DESC').first();

    return this.parserResult(result);
  }

  async getTvlTotalsByAssetAddress(
    assetAddress: string,
    pagination: IPaginationRequest,
    transformer: ITransformer,
  ) {

    const { perPage, page } = pagination;

    const results = await this.model.query()
    .withGraphJoined('asset')
    .withGraphJoined('silo')
    .where(function (this: QueryBuilder<TvlHourlyModel>) {
      this.where('asset_address', assetAddress);
    }).orderBy('timestamp', 'DESC').page(page - 1, perPage);

    return this.parserResult(new Pagination(results, perPage, page), transformer);
  }

  async getTvlTotalsByAssetSymbol(
    assetSymbol: string,
    pagination: IPaginationRequest,
    transformer: ITransformer,
  ) {

    const { perPage, page } = pagination;

    const results = await this.model.query()
    .withGraphJoined('asset')
    .withGraphJoined('silo')
    .where(function (this: QueryBuilder<TvlHourlyModel>) {
      this.where('asset.symbol', assetSymbol);
    }).orderBy('timestamp', 'DESC').page(page - 1, perPage);

    return this.parserResult(new Pagination(results, perPage, page), transformer);
  }

  async getTvlTotalsBySiloAddress(
    siloAddress: string,
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
    .where(function (this: QueryBuilder<TvlHourlyModel>) {
      this.where('silo_address', siloAddress);
    }).orderBy('timestamp', 'DESC').page(page - 1, perPage);

    return this.parserResult(new Pagination(results, perPage, page), transformer);
  }

  async getTvlTotalsBySiloName(
    siloName: string,
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
    .where(function (this: QueryBuilder<TvlHourlyModel>) {
      this.where('silo.name', siloName);
    }).orderBy('timestamp', 'DESC').page(page - 1, perPage);

    return this.parserResult(new Pagination(results, perPage, page), transformer);
  }

  async getTvlTotalsWholePlatform(
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
    .where(function (this: QueryBuilder<TvlHourlyModel>) {
      this.where('silo_address', null);
      this.where('asset_address', null);
      this.where('meta', 'all');
    }).orderBy('timestamp', 'DESC').page(page - 1, perPage);

    return this.parserResult(new Pagination(results, perPage, page), transformer);
  }
}

export default TvlBaseRepository;