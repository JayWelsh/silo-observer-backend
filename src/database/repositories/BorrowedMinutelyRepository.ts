import { BorrowedMinutelyModel } from "../models";
import BaseRepository from "./BaseRepository";

class BorrowedMinutelyRepository extends BaseRepository {
    getModel() {
      return BorrowedMinutelyModel
    }
}

export default new BorrowedMinutelyRepository();