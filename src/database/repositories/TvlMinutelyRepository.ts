import { QueryBuilder } from "objection";

import { TvlMinutelyModel } from "../models";
import TvlBaseRepository from "./TvlBaseRepository";

class TvlMinutelyRepository extends TvlBaseRepository {
  getModel() {
    return TvlMinutelyModel
  }

  async getLatestResultByNetworkAndMeta(network: string, meta: string) {
    const result = await TvlMinutelyModel.query().where(function (this: QueryBuilder<TvlMinutelyModel>) {
      this.where('network', network);
      this.where('meta', meta);
    }).orderBy('timestamp', 'DESC').first();

    return this.parserResult(result);
  }
}

export default new TvlMinutelyRepository();