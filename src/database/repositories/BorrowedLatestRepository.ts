import { QueryBuilder } from "objection";

import { BorrowedLatestModel } from "../models";
import BorrowedBaseRepository from "./BorrowedBaseRepository";

class BorrowedLatestRepository extends BorrowedBaseRepository {
  getModel() {
    return BorrowedLatestModel
  }

  async getLatestResultByNetworkAndMetaAndDeploymentID(network: string, meta: string, deploymentID: string) {

    let tableName = BorrowedLatestModel.tableName;

    const result = await BorrowedLatestModel.query().where(function (this: QueryBuilder<BorrowedLatestModel>) {
      this.where('network', network);
      this.where('meta', meta);
      this.where(`${tableName}.deployment_id`, deploymentID);
    }).orderBy('timestamp', 'DESC').first();

    return this.parserResult(result);
  }
}

export default new BorrowedLatestRepository();