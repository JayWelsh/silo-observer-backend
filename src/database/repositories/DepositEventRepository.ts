import { DepositEventModel } from "../models";
import BaseRepository from "./BaseRepository";

class DepositEventRepository extends BaseRepository {
  getModel() {
    return DepositEventModel
  }
}

export default new DepositEventRepository();