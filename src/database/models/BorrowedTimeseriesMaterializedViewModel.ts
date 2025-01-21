import {
  BORROWED_TIMESERIES_WITH_GAPS_MATERIALIZED_VIEW,
  ASSET_TABLE,
} from "../tables";
import BaseModel from "./BaseModel";
import AssetModel from "./AssetModel";

export default class BorrowedTimeseriesMaterializedViewModel extends BaseModel {
    static get tableName() {
        return BORROWED_TIMESERIES_WITH_GAPS_MATERIALIZED_VIEW
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
              from: `${BORROWED_TIMESERIES_WITH_GAPS_MATERIALIZED_VIEW}.asset_address`,
              to: `${ASSET_TABLE}.address`,
          }
        },
      }
    }
}