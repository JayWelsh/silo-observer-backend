import { QueryBuilder } from "objection";

import { SubgraphIndexerBlockTrackerModel } from "../models";
import BaseRepository from "./BaseRepository";

class SubgraphIndexerBlockTrackerRepository extends BaseRepository {
  getModel() {
    return SubgraphIndexerBlockTrackerModel
  }

  async getByRecordTypeAndNetwork(
    recordType: string,
    network: string,
    deploymentId: string,
  ) {

    const result = await this.model.query()
    .where(function (this: QueryBuilder<SubgraphIndexerBlockTrackerModel>) {
      this.where('record_type', recordType);
      this.where('network', network);
      this.where('deployment_id', deploymentId);
    }).first();

    return this.parserResult(result);
  }

  async getLowestLastCheckedBlockRecordByNetworkAndDeploymentId(
    network: string,
    deploymentId: string,
  ) {

    const result = await this.model.query()
    .where(function (this: QueryBuilder<SubgraphIndexerBlockTrackerModel>) {
      this.where('network', network);
      this.where('deployment_id', deploymentId);
      this.where('is_sanity_checker', false);
    }).orderBy('last_checked_block', "ASC").first();

    return this.parserResult(result);
  }
}

export default new SubgraphIndexerBlockTrackerRepository();