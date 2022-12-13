import { RateModel } from "../models";
import RateBaseRepository from "./RateBaseRepository";

class RateRepository extends RateBaseRepository {
  getModel() {
    return RateModel
  }
}

export default new RateRepository();