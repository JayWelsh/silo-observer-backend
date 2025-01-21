import {
  ASSET_TABLE,
  TVL_TIMESERIES_FILLED,
} from "../tables";
import BaseModel from "./BaseModel";
import AssetModel from "./AssetModel";

export default class TvlTimeseriesFilledModel extends BaseModel {
    static get tableName() {
        return TVL_TIMESERIES_FILLED
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
              from: `${TVL_TIMESERIES_FILLED}.asset_address`,
              to: `${ASSET_TABLE}.address`,
          }
        },
      }
    }
}