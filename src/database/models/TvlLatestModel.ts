import {
  TVL_LATEST_TABLE,
  ASSET_TABLE,
  SILO_TABLE,
} from "../tables";
import BaseModel from "./BaseModel";
import AssetModel from "./AssetModel";
import SiloModel from "./SiloModel";

export default class TvlLatestModel extends BaseModel {
    static get tableName() {
        return TVL_LATEST_TABLE
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
              from: `${TVL_LATEST_TABLE}.asset_address`,
              to: `${ASSET_TABLE}.address`,
          }
        },
        silo: {
          relation: BaseModel.HasOneRelation,
          modelClass: SiloModel,
          join: {
              from: `${TVL_LATEST_TABLE}.silo_address`,
              to: `${SILO_TABLE}.address`,
          }
        }
      }
    }
}