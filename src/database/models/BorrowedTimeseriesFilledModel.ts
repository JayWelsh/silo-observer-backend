import {
  ASSET_TABLE,
  BORROWED_TIMESERIES_FILLED,
} from "../tables";
import BaseModel from "./BaseModel";
import AssetModel from "./AssetModel";

export default class BorrowedTimeseriesFilledModel extends BaseModel {
    static get tableName() {
        return BORROWED_TIMESERIES_FILLED
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
              from: `${BORROWED_TIMESERIES_FILLED}.asset_address`,
              to: `${ASSET_TABLE}.address`,
          }
        },
      }
    }
}