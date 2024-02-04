import { QueryBuilder } from "objection";

import { SubgraphLiquidationRecordModel } from "../models";
import BaseRepository from "./BaseRepository";
import Pagination, { IPaginationRequest } from "../../utils/Pagination";
import { ITransformer, IVolumeTimeseriesQueryResult } from "../../interfaces";

class SubgraphLiquidationRecordRepository extends BaseRepository {
  getModel() {
    return SubgraphLiquidationRecordModel
  }

  async getLiquidationRecords(
    pagination: IPaginationRequest,
    networks: string[] | undefined,
    transformer: ITransformer,
  ) {

    const { 
      perPage,
      page
    } = pagination;

    let tableName = this.model.tableName;

    const results = await this.model.query()
    .withGraphJoined('silo')
    .withGraphJoined('asset')
    .where(function (this: QueryBuilder<SubgraphLiquidationRecordModel>) {
      if(networks) {
        for(let [index, network] of networks.entries()) {
          if(index === 0) {
            this.where(`${tableName}.network`, '=', network);
          } else {
            this.orWhere(`${tableName}.network`, '=', network);
          }
        }
      }
    })
    .orderBy('timestamp_unix', 'DESC').page(page - 1, perPage);

    return this.parserResult(new Pagination(results, perPage, page), transformer);
  }
}

export default new SubgraphLiquidationRecordRepository();