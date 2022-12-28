import { WithdrawEventModel } from "../models";
import BaseRepository from "./BaseRepository";

class WithdrawEventRepository extends BaseRepository {
  getModel() {
    return WithdrawEventModel
  }
}

export default new WithdrawEventRepository();