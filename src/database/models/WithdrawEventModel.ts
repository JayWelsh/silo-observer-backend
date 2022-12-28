import { WITHDRAW_EVENT_TABLE } from "../tables";
import BaseModel from "./BaseModel";

export default class WithdrawEventModel extends BaseModel {
    static get tableName() {
      return  WITHDRAW_EVENT_TABLE
    }

    static get idColumn() {
      return "id"
    }
}