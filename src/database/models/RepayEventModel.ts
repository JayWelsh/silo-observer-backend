import { 
  REPAY_EVENT_TABLE,
  ASSET_TABLE,
  SILO_TABLE,
  BLOCK_METADATA_TABLE,
} from "../tables";
import AssetModel from "./AssetModel";
import SiloModel from "./SiloModel";
import BaseModel from "./BaseModel";
import BlockMetadataModel from "./BlockMetadataModel";

export default class RepayEventModel extends BaseModel {
    static get tableName() {
      return REPAY_EVENT_TABLE
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
              from: `${REPAY_EVENT_TABLE}.asset_address`,
              to: `${ASSET_TABLE}.address`,
          }
        },
        silo: {
          relation: BaseModel.HasOneRelation,
          modelClass: SiloModel,
          join: {
              from: `${REPAY_EVENT_TABLE}.silo_address`,
              to: `${SILO_TABLE}.address`,
          }
        },
        block_metadata: {
          relation: BaseModel.HasOneRelation,
          modelClass: BlockMetadataModel,
          join: {
              from: `${REPAY_EVENT_TABLE}.block_number`,
              to: `${BLOCK_METADATA_TABLE}.block_number`,
          }
        }
      }
    }
}