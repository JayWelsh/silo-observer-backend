import { QueryBuilder } from "objection";

import { DeploymentIdToSyncMetadataModel } from "../models";
import BaseRepository from "./BaseRepository";

class DeploymentIdToSyncMetadataRepository extends BaseRepository {
  getModel() {
    return DeploymentIdToSyncMetadataModel
  }

  async getSyncRecord(deploymentId: string, network: string, syncType: string) {

    const results = await this.model.query()
      .where(function (this: QueryBuilder<DeploymentIdToSyncMetadataModel>) {
        this.where('deployment_id', deploymentId);
        this.where('network', network);
        this.where('sync_type', syncType);
      }).first();

    return this.parserResult(results);

  }
}

export default new DeploymentIdToSyncMetadataRepository();