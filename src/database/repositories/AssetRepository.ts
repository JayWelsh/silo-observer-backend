import { AssetModel } from "../models";
import BaseRepository from "./BaseRepository";
import { QueryBuilder } from "objection";
import Pagination, { IPaginationRequest } from "../../utils/Pagination";

class AssetRepository extends BaseRepository {
    getModel() {
      return AssetModel
    }

    async getAssetByAddress(assetAddress: string) {
      const result = await this.model.query().where(function (this: QueryBuilder<AssetModel>) {
        this.where('address', assetAddress);
      }).first();

      return this.parserResult(result);
    }

    async getAssets(pagination: IPaginationRequest) {

      const { perPage, page } = pagination;

      const results = await this.model.query().page(page - 1, perPage);
      
      return this.parserResult(new Pagination(results, perPage, page))
    }
}

export default new AssetRepository()
