import {
  UNIFIED_EVENTS_MATERIALIZED_VIEW,
  ASSET_TABLE,
  SILO_TABLE,
  BLOCK_METADATA_TABLE,
} from "../tables";
import BaseModel from "./BaseModel";
import BlockMetadataModel from './BlockMetadataModel';
import AssetModel from "./AssetModel";
import SiloModel from "./SiloModel";

export default class UnifiedEventModel extends BaseModel {
    static get tableName() {
      return  UNIFIED_EVENTS_MATERIALIZED_VIEW
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
              from: `${UNIFIED_EVENTS_MATERIALIZED_VIEW}.asset_address`,
              to: `${ASSET_TABLE}.address`,
          }
        },
        silo: {
          relation: BaseModel.HasOneRelation,
          modelClass: SiloModel,
          join: {
              from: `${UNIFIED_EVENTS_MATERIALIZED_VIEW}.silo_address`,
              to: `${SILO_TABLE}.address`,
          }
        },
        block_metadata: {
          relation: BaseModel.HasOneRelation,
          modelClass: BlockMetadataModel,
          join: {
              from: `${UNIFIED_EVENTS_MATERIALIZED_VIEW}.block_number`,
              to: `${BLOCK_METADATA_TABLE}.block_number`,
          }
        }
      }
    }
}