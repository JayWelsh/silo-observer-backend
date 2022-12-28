import { SILO_USER_TABLE } from "../tables";
import BaseModel from "./BaseModel";

export default class SiloUserModel extends BaseModel {
    static get tableName() {
      return SILO_USER_TABLE
    }

    static get idColumn() {
      return "id"
    }
}