import { RepayEventModel } from "../models";
import BaseRepository from "./BaseRepository";

class RepayEventRepository extends BaseRepository {
  getModel() {
    return RepayEventModel
  }
}

export default new RepayEventRepository();