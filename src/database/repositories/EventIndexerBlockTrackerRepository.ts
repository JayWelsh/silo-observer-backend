import { QueryBuilder } from "objection";

import { EventIndexerBlockTrackerModel } from "../models";
import BaseRepository from "./BaseRepository";

class EventIndexerBlockTrackerRepository extends BaseRepository {
  getModel() {
    return EventIndexerBlockTrackerModel
  }

  async getByEventNameAndNetwork(
    eventName: string,
    network: string,
    deploymentId: string,
  ) {

    const result = await this.model.query()
    .where(function (this: QueryBuilder<EventIndexerBlockTrackerModel>) {
      this.where('event_name', eventName);
      this.where('network', network);
      this.where('deployment_id', deploymentId);
    }).first();

    return this.parserResult(result);
  }
}

export default new EventIndexerBlockTrackerRepository();