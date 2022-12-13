import { BorrowedHourlyModel } from "../models";
import BorrowedBaseRepository from "./BorrowedBaseRepository";

class BorrowedHourlyRepository extends BorrowedBaseRepository {
  getModel() {
    return BorrowedHourlyModel
  }
}

export default new BorrowedHourlyRepository();