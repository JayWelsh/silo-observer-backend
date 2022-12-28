import { BorrowEventModel } from "../models";
import BaseRepository from "./BaseRepository";

class BorrowEventRepository extends BaseRepository {
  getModel() {
    return BorrowEventModel
  }
}

export default new BorrowEventRepository();