import { TvlMinutelyModel } from "../models";
import TvlBaseRepository from "./TvlBaseRepository";

class TvlMinutelyRepository extends TvlBaseRepository {
  getModel() {
    return TvlMinutelyModel
  }
}

export default new TvlMinutelyRepository();