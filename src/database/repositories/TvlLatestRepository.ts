import { QueryBuilder } from "objection";

import { TvlLatestModel } from "../models";
import TvlBaseRepository from "./TvlBaseRepository";

class TvlLatestRepository extends TvlBaseRepository {
  getModel() {
    return TvlLatestModel
  }

  async getLatestResultByNetworkAndMetaAndDeploymentID(network: string, meta: string, deploymentID: string) {

    let tableName = TvlLatestModel.tableName;

    const result = await TvlLatestModel.query().where(function (this: QueryBuilder<TvlLatestModel>) {
      this.where('network', network);
      this.where('meta', meta);
      this.where(`${tableName}.deployment_id`, deploymentID);
    }).orderBy('timestamp', 'DESC').first();

    return this.parserResult(result);
  }
}

export default new TvlLatestRepository();