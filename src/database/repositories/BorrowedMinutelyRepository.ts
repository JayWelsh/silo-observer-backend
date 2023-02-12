import { QueryBuilder } from "objection";

import { BorrowedMinutelyModel } from "../models";
import BorrowedBaseRepository from "./BorrowedBaseRepository";

class BorrowedMinutelyRepository extends BorrowedBaseRepository {
  getModel() {
    return BorrowedMinutelyModel
  }

  async getLatestResultByNetworkAndMeta(network: string, meta: string) {
    const result = await BorrowedMinutelyModel.query().where(function (this: QueryBuilder<BorrowedMinutelyModel>) {
      this.where('network', network);
      this.where('meta', meta);
    }).orderBy('timestamp', 'DESC').first();

    return this.parserResult(result);
  }
}

export default new BorrowedMinutelyRepository();