import { TvlHourlyModel } from "../models";
import TvlBaseRepository from "./TvlBaseRepository";

class TvlHourlyRepository extends TvlBaseRepository {
  getModel() {
    return TvlHourlyModel
  }
}

export default new TvlHourlyRepository();