import { BorrowedHourlyModel } from "../models";
import BaseRepository from "./BaseRepository";

class BorrowedHourlyRepository extends BaseRepository {
    getModel() {
      return BorrowedHourlyModel
    }
}

export default new BorrowedHourlyRepository();