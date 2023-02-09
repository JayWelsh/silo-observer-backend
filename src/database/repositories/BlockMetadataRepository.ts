import { QueryBuilder } from "objection";

import { BlockMetadataModel } from "../models";
import BaseRepository from "./BaseRepository";

class BlockMetadataRepository extends BaseRepository {
  getModel() {
    return BlockMetadataModel
  }

  async getByBlockNumberAndNetwork(
    blockNumber: number,
    network: string,
  ) {

    const result = await this.model.query()
    .where(function (this: QueryBuilder<BlockMetadataModel>) {
      this.where('block_number', blockNumber);
      this.where('network', network);
    }).first();

    return this.parserResult(result);
  }
}

export default new BlockMetadataRepository();