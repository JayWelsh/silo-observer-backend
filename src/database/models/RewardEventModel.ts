import { 
  REWARD_EVENT_TABLE,
  ASSET_TABLE,
  BLOCK_METADATA_TABLE,
} from "../tables";
import AssetModel from "./AssetModel";
import BaseModel from "./BaseModel";
import BlockMetadataModel from "./BlockMetadataModel";

export default class RewardEventModel extends BaseModel {
    static get tableName() {
      return REWARD_EVENT_TABLE
    }

    static get idColumn() {
      return "id"
    }

    static get relationMappings() {
      return {
        asset: {
          relation: BaseModel.HasOneRelation,
          modelClass: AssetModel,
          join: {
              from: `${REWARD_EVENT_TABLE}.asset_address`,
              to: `${ASSET_TABLE}.address`,
          }
        },
        block_metadata: {
          relation: BaseModel.HasOneRelation,
          modelClass: BlockMetadataModel,
          join: {
              from: `${REWARD_EVENT_TABLE}.block_number`,
              to: `${BLOCK_METADATA_TABLE}.block_number`,
          }
        }
      }
    }
}