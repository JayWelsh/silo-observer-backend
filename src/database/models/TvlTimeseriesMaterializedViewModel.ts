import {
  TVL_HOURLY_TABLE,
  ASSET_TABLE,
  TVL_TIMESERIES_WITH_GAPS_MATERIALIZED_VIEW,
} from "../tables";
import BaseModel from "./BaseModel";
import AssetModel from "./AssetModel";

export default class TvlMaterializedViewModel extends BaseModel {
    static get tableName() {
        return TVL_TIMESERIES_WITH_GAPS_MATERIALIZED_VIEW
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
              from: `${TVL_HOURLY_TABLE}.asset_address`,
              to: `${ASSET_TABLE}.address`,
          }
        },
      }
    }
}