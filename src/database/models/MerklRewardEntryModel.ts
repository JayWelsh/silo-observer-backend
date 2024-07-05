import { 
  MERKL_REWARD_ENTRY_TABLE,
  ASSET_TABLE,
} from "../tables";
import AssetModel from "./AssetModel";
import BaseModel from "./BaseModel";

export default class MerklRewardEntryModel extends BaseModel {
    static get tableName() {
      return MERKL_REWARD_ENTRY_TABLE
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
              from: `${MERKL_REWARD_ENTRY_TABLE}.asset_address`,
              to: `${ASSET_TABLE}.address`,
          }
        },
      }
    }
}