import { RateLatestModel } from "../models";
import RateBaseRepository from "./RateBaseRepository";

class RateLatestRepository extends RateBaseRepository {
  getModel() {
    return RateLatestModel
  }
}

export default new RateLatestRepository();