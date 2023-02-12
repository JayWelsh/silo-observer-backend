import { QueryBuilder } from "objection";

import { BorrowedLatestModel } from "../models";
import BorrowedBaseRepository from "./BorrowedBaseRepository";

class BorrowedLatestRepository extends BorrowedBaseRepository {
  getModel() {
    return BorrowedLatestModel
  }

  async getLatestResultByNetworkAndMeta(network: string, meta: string) {
    const result = await BorrowedLatestModel.query().where(function (this: QueryBuilder<BorrowedLatestModel>) {
      this.where('network', network);
      this.where('meta', meta);
    }).orderBy('timestamp', 'DESC').first();

    return this.parserResult(result);
  }
}

export default new BorrowedLatestRepository();