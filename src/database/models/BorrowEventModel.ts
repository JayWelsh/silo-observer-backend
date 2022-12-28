import { BORROW_EVENT_TABLE } from "../tables";
import BaseModel from "./BaseModel";

export default class BorrowEventModel extends BaseModel {
    static get tableName() {
      return BORROW_EVENT_TABLE
    }

    static get idColumn() {
      return "id"
    }
}