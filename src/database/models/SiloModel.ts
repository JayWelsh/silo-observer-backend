import {
    SILO_TABLE,
    ASSET_TABLE,
    RATE_LATEST_TABLE,
} from "../tables";
import BaseModel from "./BaseModel";
import AssetModel from "./AssetModel";
import RateLatestModel from "./RateLatestModel";

export default class SiloModel extends BaseModel {
    static get tableName() {
        return SILO_TABLE
    }

    static get idColumn() {
        return "id"
    }

    static get relationMappings() {
        return {
            input_token: {
                relation: BaseModel.HasOneRelation,
                modelClass: AssetModel,
                join: {
                    from: `${SILO_TABLE}.input_token_address`,
                    to: `${ASSET_TABLE}.address`,
                }
            },
            latest_rates: {
                relation: BaseModel.HasManyRelation,
                modelClass: RateLatestModel,
                join: {
                    from: `${SILO_TABLE}.address`,
                    to: `${RATE_LATEST_TABLE}.silo_address`,
                }
            },
        }
    }
}