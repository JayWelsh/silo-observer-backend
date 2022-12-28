import { BLOCK_METADATA_TABLE } from "../tables";
import BaseModel from "./BaseModel";

export default class BlockMetadataModel extends BaseModel {
    static get tableName() {
      return BLOCK_METADATA_TABLE
    }

    static get idColumn() {
      return "id"
    }
}