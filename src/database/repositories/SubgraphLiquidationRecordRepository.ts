import { SubgraphLiquidationRecordModel } from "../models";
import RateBaseRepository from "./RateBaseRepository";

class SubgraphLiquidationRecordRepository extends RateBaseRepository {
  getModel() {
    return SubgraphLiquidationRecordModel
  }
}

export default new SubgraphLiquidationRecordRepository();