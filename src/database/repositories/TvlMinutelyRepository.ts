import { TvlMinutelyModel } from "../models";
import BaseRepository from "./BaseRepository";

class TvlMinutelyRepository extends BaseRepository {
    getModel() {
      return TvlMinutelyModel
    }
}

export default new TvlMinutelyRepository();