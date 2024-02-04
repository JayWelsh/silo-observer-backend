import { SUBGRAPH_INDEXER_BLOCK_TRACKER_TABLE } from "../tables";
import BaseModel from "./BaseModel";

export default class SubgraphIndexerBlockTrackerModel extends BaseModel {
    static get tableName() {
      return SUBGRAPH_INDEXER_BLOCK_TRACKER_TABLE
    }

    static get idColumn() {
      return "id"
    }
}