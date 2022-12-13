import { BorrowedMinutelyModel } from "../models";
import BorrowedBaseRepository from "./BorrowedBaseRepository";

class BorrowedMinutelyRepository extends BorrowedBaseRepository {
  getModel() {
    return BorrowedMinutelyModel
  }
}

export default new BorrowedMinutelyRepository();