import { QueryBuilder } from "objection";

import { TvlMinutelyModel } from "../models";
import TvlBaseRepository from "./TvlBaseRepository";

class TvlMinutelyRepository extends TvlBaseRepository {
  getModel() {
    return TvlMinutelyModel
  }

  async getLatestResultByNetworkAndMetaAndDeploymentID(network: string, meta: string, deploymentID: string) {

    let tableName = TvlMinutelyModel.tableName;

    const result = await TvlMinutelyModel.query().where(function (this: QueryBuilder<TvlMinutelyModel>) {
      this.where('network', network);
      this.where('meta', meta);
      this.where(`${tableName}.deployment_id`, deploymentID);
    }).orderBy('timestamp', 'DESC').first();

    return this.parserResult(result);
  }
}

export default new TvlMinutelyRepository();