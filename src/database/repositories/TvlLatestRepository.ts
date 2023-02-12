import { QueryBuilder } from "objection";

import { TvlLatestModel } from "../models";
import TvlBaseRepository from "./TvlBaseRepository";

class TvlLatestRepository extends TvlBaseRepository {
  getModel() {
    return TvlLatestModel
  }

  async getLatestResultByNetworkAndMeta(network: string, meta: string) {
    const result = await TvlLatestModel.query().where(function (this: QueryBuilder<TvlLatestModel>) {
      this.where('network', network);
      this.where('meta', meta);
    }).orderBy('timestamp', 'DESC').first();

    return this.parserResult(result);
  }
}

export default new TvlLatestRepository();