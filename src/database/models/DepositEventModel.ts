import { DEPOSIT_EVENT_TABLE } from "../tables";
import BaseModel from "./BaseModel";

export default class DepositEventModel extends BaseModel {
    static get tableName() {
      return DEPOSIT_EVENT_TABLE
    }

    static get idColumn() {
      return "id"
    }
}