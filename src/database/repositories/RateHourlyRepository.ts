import { QueryBuilder } from "objection";

import { RateModel } from "../models";
import BaseRepository from "./BaseRepository";
import Pagination, { IPaginationRequest } from "../../utils/Pagination";
import { ITransformer } from "../../interfaces";

class RateHourlyRepository extends BaseRepository {
    getModel() {
      return RateModel
    }

    async getLatestRateByAssetOnSideInSilo(
      assetAddress: string,
      side: string,
      siloAddress: string,
    ) {
      const result = await this.model.query()
      .withGraphJoined('asset')
      .withGraphJoined('silo')
      .where(function (this: QueryBuilder<RateModel>) {
        this.where('asset_address', assetAddress);
        this.where('side', side);
        this.where('silo_address', siloAddress);
      }).orderBy('timestamp', 'DESC').first();

      return this.parserResult(result);
    }

    async getOldestRateByAssetOnSideInSilo(
      assetAddress: string,
      side: string,
      siloAddress: string,
    ) {
      const result = await this.model.query()
      .withGraphJoined('asset')
      .withGraphJoined('silo')
      .where(function (this: QueryBuilder<RateModel>) {
        this.where('asset_address', assetAddress);
        this.where('side', side);
        this.where('silo_address', siloAddress);
      }).orderBy('timestamp', 'ASC').first();

      return this.parserResult(result);
    }

    async getRatesByAssetAddress(
      assetAddress: string,
      side: string | undefined,
      pagination: IPaginationRequest,
      transformer: ITransformer,
    ) {

      const { perPage, page } = pagination;

      const results = await this.model.query()
      .withGraphJoined('asset')
      .withGraphJoined('silo')
      .where(function (this: QueryBuilder<RateModel>) {
        this.where('asset_address', assetAddress);
        if(side) {
          this.where('side', side);
        }
      }).orderBy('timestamp', 'DESC').page(page - 1, perPage);

      return this.parserResult(new Pagination(results, perPage, page), transformer);
    }

    async getRatesByAssetSymbol(
      assetAddress: string,
      side: string | undefined,
      pagination: IPaginationRequest,
      transformer: ITransformer,
    ) {

      const { perPage, page } = pagination;

      const results = await this.model.query()
      .withGraphJoined('asset')
      .withGraphJoined('silo')
      .where(function (this: QueryBuilder<RateModel>) {
        this.where('asset.symbol', assetAddress);
        if(side) {
          this.where('side', side);
        }
      }).orderBy('timestamp', 'DESC').page(page - 1, perPage);

      return this.parserResult(new Pagination(results, perPage, page), transformer);
    }

    async getRatesBySiloAddress(
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
      .where(function (this: QueryBuilder<RateModel>) {
        this.where('silo_address', siloAddress);
      }).orderBy('timestamp', 'DESC').page(page - 1, perPage);

      return this.parserResult(new Pagination(results, perPage, page), transformer);
    }

    async getRatesBySiloName(
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
      .where(function (this: QueryBuilder<RateModel>) {
        this.where('silo.name', siloName);
      }).orderBy('timestamp', 'DESC').page(page - 1, perPage);

      return this.parserResult(new Pagination(results, perPage, page), transformer);
    }

    async getRateRecordCountByAssetOnSideInSilo(assetAddress: string, side: string, siloAddress: string) {
      const result = await this.model.query().where(function (this: QueryBuilder<RateModel>) {
        this.where('asset_address', assetAddress);
        this.where('side', side);
        this.where('silo_address', siloAddress);
      }).count();

      return result?.[0]?.count ? result?.[0]?.count : 0;
    }
}

export default new RateHourlyRepository();