import { RateHourlyModel } from "../models";
import RateBaseRepository from "./RateBaseRepository";

class RateHourlyRepository extends RateBaseRepository {
  getModel() {
    return RateHourlyModel
  }
}

export default new RateHourlyRepository();