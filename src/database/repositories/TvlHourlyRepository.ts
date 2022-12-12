import { TvlHourlyModel } from "../models";
import BaseRepository from "./BaseRepository";

class TvlHourlyRepository extends BaseRepository {
  getModel() {
    return TvlHourlyModel
  }
}

export default new TvlHourlyRepository();