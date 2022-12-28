import { EVENT_INDEXER_BLOCK_TRACKER_TABLE } from "../tables";
import BaseModel from "./BaseModel";

export default class EventIndexerBlockTrackerModel extends BaseModel {
    static get tableName() {
      return EVENT_INDEXER_BLOCK_TRACKER_TABLE
    }

    static get idColumn() {
      return "id"
    }
}