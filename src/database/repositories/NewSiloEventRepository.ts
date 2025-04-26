import { QueryBuilder, raw } from "objection";

import { 
  NewSiloEventModel,
} from "../models";
import BaseRepository from "./BaseRepository";
import Pagination, { IPaginationRequest } from "../../utils/Pagination";
import { ITransformer, IVolumeTimeseriesQueryResult } from "../../interfaces";

class NewSiloEventRepository extends BaseRepository {
  getModel() {
    return NewSiloEventModel
  }

  async getNewSiloEvents(
    pagination: IPaginationRequest,
    networks: string[] | undefined,
    versions: string[] | undefined,
    transformer: ITransformer,
  ) {

    const { 
      perPage,
      page
    } = pagination;

    let tableName = this.model.tableName;

    const results = await this.model.query()
    .withGraphJoined('block_metadata')
    .modify((queryBuilder: QueryBuilder<NewSiloEventModel>) => {
        if (networks?.length) {
            queryBuilder.whereIn(`${tableName}.network`, networks);
        }
        if (versions?.length) {
            queryBuilder.whereIn(`${tableName}.protocol_version`, versions);
        }
    })
    .orderBy('block_metadata.block_timestamp_unix', 'DESC').page(page - 1, perPage);

    return this.parserResult(new Pagination(results, perPage, page), transformer);
  }

  async getNewSiloEventsSinceDate(
    unixTimestampStartDate: string | number,
  ) {
    const results = await this.model.query()
      .withGraphJoined('block_metadata')
      .where(function (this: QueryBuilder<NewSiloEventModel>) {
        this.where('block_metadata.block_timestamp_unix', '>=', unixTimestampStartDate);
      })
      .orderBy('block_metadata.block_timestamp_unix', 'ASC')

      return this.parserResult(results);
  }

  async getNewSiloEventsByFactoryAddress(
    factoryAddress: string,
  ) {
    const results = await this.model.query()
      .where(function (this: QueryBuilder<NewSiloEventModel>) {
        this.where('silo_factory', '=', factoryAddress);
      })
      .orderBy('id', 'ASC')

      return this.parserResult(results);
  }

  async getNewSiloEventsByDeploymentId(
    factoryAddress: string,
  ) {
    const results = await this.model.query()
      .where(function (this: QueryBuilder<NewSiloEventModel>) {
        this.where('deployment_id', '=', factoryAddress);
      })
      .orderBy('id', 'ASC')

      return this.parserResult(results);
  }

  async getAllNewSiloEvents() {
    const results = await this.model.query()
      .orderBy('id', 'ASC')

      return this.parserResult(results);
  }

}

export default new NewSiloEventRepository();