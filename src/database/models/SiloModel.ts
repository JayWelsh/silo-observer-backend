import {
    SILO_TABLE,
    ASSET_TABLE,
} from "../tables";
import BaseModel from "./BaseModel";
import AssetModel from "./AssetModel";

export default class SiloModel extends BaseModel {
    static get tableName() {
        return SILO_TABLE
    }

    static get idColumn() {
        return "id"
    }

    static get relationMappings() {
        return {
            inputToken: {
                relation: BaseModel.HasOneRelation,
                modelClass: AssetModel,
                join: {
                    from: `${SILO_TABLE}.input_token_address`,
                    to: `${ASSET_TABLE}.address`,
                }
            }
        }
    }
}