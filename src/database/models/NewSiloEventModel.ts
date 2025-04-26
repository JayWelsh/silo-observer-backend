import { 
  NEW_SILO_EVENT_TABLE,
  BLOCK_METADATA_TABLE,
} from "../tables";
import BaseModel from "./BaseModel";
import BlockMetadataModel from "./BlockMetadataModel";

export default class NewSiloEventModel extends BaseModel {
  static get tableName() {
    return NEW_SILO_EVENT_TABLE
  }

  static get idColumn() {
    return "id"
  }

  static get relationMappings() {
    return {
      block_metadata: {
        relation: BaseModel.HasOneRelation,
        modelClass: BlockMetadataModel,
        join: {
            from: `${NEW_SILO_EVENT_TABLE}.block_number`,
            to: `${BLOCK_METADATA_TABLE}.block_number`,
        }
      }
    }
  }
}