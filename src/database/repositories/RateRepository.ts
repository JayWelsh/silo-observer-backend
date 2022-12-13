import { QueryBuilder } from "objection";

import { RateModel } from "../models";
import RateBaseRepository from "./RateBaseRepository";
import Pagination, { IPaginationRequest } from "../../utils/Pagination";
import { ITransformer } from "../../interfaces";

class RateRepository extends RateBaseRepository {
  getModel() {
    return RateModel
  }
}

export default new RateRepository();