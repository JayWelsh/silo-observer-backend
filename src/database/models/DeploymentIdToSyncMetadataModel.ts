import { DEPLOYMENT_ID_TO_SYNC_METADATA } from "../tables";
import BaseModel from "./BaseModel";

export default class DeploymentIdToSyncMetadataModel extends BaseModel {
    static get tableName() {
      return DEPLOYMENT_ID_TO_SYNC_METADATA
    }

    static get idColumn() {
      return "id"
    }
}