import { QueryBuilder } from "objection";

import { BorrowedMinutelyModel } from "../models";
import BorrowedBaseRepository from "./BorrowedBaseRepository";

class BorrowedMinutelyRepository extends BorrowedBaseRepository {
  getModel() {
    return BorrowedMinutelyModel
  }

  async getLatestResultByNetworkAndMetaAndDeploymentID(network: string, meta: string, deploymentID: string) {

    let tableName = BorrowedMinutelyModel.tableName;
    
    const result = await BorrowedMinutelyModel.query().where(function (this: QueryBuilder<BorrowedMinutelyModel>) {
      this.where('network', network);
      this.where('meta', meta);
      this.where(`${tableName}.deployment_id`, deploymentID);
    }).orderBy('timestamp', 'DESC').first();

    return this.parserResult(result);
  }
}

export default new BorrowedMinutelyRepository();