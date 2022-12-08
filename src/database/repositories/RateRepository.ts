import { RateModel } from "../models";
import BaseRepository from "./BaseRepository";
import { QueryBuilder } from "objection";
import Pagination, { IPaginationRequest } from "../../utils/Pagination";

class RateRepository extends BaseRepository {
    getModel() {
      return RateModel
    }

    async getLatestRateByAssetOnSideInSilo(assetAddress: string, side: string, siloAddress: string) {
      const result = await this.model.query().where(function (this: QueryBuilder<RateModel>) {
        this.where('asset_address', assetAddress);
        this.where('side', side);
        this.where('silo_address', siloAddress);
      }).orderBy('timestamp', 'DESC').first();

      return this.parserResult(result);
    }

    async getOldestRateByAssetOnSideInSilo(assetAddress: string, side: string, siloAddress: string) {
      const result = await this.model.query().where(function (this: QueryBuilder<RateModel>) {
        this.where('asset_address', assetAddress);
        this.where('side', side);
        this.where('silo_address', siloAddress);
      }).orderBy('timestamp', 'ASC').first();

      return this.parserResult(result);
    }

    async getRatesByAssetAddress(assetAddress: string, pagination: IPaginationRequest) {

      const { perPage, page } = pagination;

      const results = await this.model.query().where(function (this: QueryBuilder<RateModel>) {
        this.where('asset.address', assetAddress);
      }).page(page - 1, perPage);

      return this.parserResult(new Pagination(results, perPage, page));
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

export default new RateRepository();