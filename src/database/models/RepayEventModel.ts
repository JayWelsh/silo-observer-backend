import { REPAY_EVENT_TABLE } from "../tables";
import BaseModel from "./BaseModel";

export default class RepayEventModel extends BaseModel {
    static get tableName() {
      return REPAY_EVENT_TABLE
    }

    static get idColumn() {
      return "id"
    }
}