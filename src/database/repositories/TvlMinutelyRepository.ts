import { TvlMinutelyModel } from "../models";
import TvlBaseRepository from "./BaseRepository";

class TvlMinutelyRepository extends TvlBaseRepository {
  getModel() {
    return TvlMinutelyModel
  }
}

export default new TvlMinutelyRepository();