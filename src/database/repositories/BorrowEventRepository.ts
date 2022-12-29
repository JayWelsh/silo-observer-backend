import { QueryBuilder, raw } from "objection";

import { BorrowEventModel } from "../models";
import BaseRepository from "./BaseRepository";
import Pagination, { IPaginationRequest } from "../../utils/Pagination";
import { ITransformer } from "../../interfaces";

class BorrowEventRepository extends BaseRepository {
  getModel() {
    return BorrowEventModel
  }

  async getBorrowEvents(
    pagination: IPaginationRequest,
    transformer: ITransformer,
  ) {

    const { 
      perPage,
      page
    } = pagination;

    const results = await this.model.query()
    .withGraphJoined('silo')
    .withGraphJoined('asset')
    .orderBy('block_number', 'DESC').page(page - 1, perPage);

    return this.parserResult(new Pagination(results, perPage, page), transformer);
  }

  async getBorrowEventsDistinctUsersPerDay(
    pagination: IPaginationRequest,
    transformer: ITransformer,
    skipPagination?: boolean,
  ) {

    const { 
      perPage,
      page
    } = pagination;

    const paginationModifier = (query: any, page: number, perPage: number, skipPagination: boolean) => {
      if(!skipPagination) {
        query.page(page - 1, perPage);
      }
    }

    const results = await this.model.query()
      .select(raw('DISTINCT user_address, block_metadata.block_day_timestamp'))
      .leftJoin(
        'block_metadata',
        'block_metadata.block_number',
        'borrow_event.block_number',
      )
      .orderBy('block_day_timestamp', 'DESC')
      .modify(paginationModifier, page, perPage, skipPagination);

    if(!skipPagination) {
      return this.parserResult(new Pagination(results, perPage, page), transformer);
    } else {
      return this.parserResult(results, transformer);
    }
 
  }

  async getBorrowEventsBySiloAddress(
    siloAddress: string,
    pagination: IPaginationRequest,
    transformer: ITransformer,
  ) {

    const { 
      perPage,
      page
    } = pagination;

    const results = await this.model.query()
    .withGraphJoined('silo')
    .withGraphJoined('asset')
    .where(function (this: QueryBuilder<BorrowEventModel>) {
      this.where('silo_address', siloAddress);
    }).orderBy('block_number', 'DESC').page(page - 1, perPage);

    return this.parserResult(new Pagination(results, perPage, page), transformer);
  }

  async getBorrowEventsBySiloName(
    siloName: string,
    pagination: IPaginationRequest,
    transformer: ITransformer,
  ) {

    const { 
      perPage,
      page
    } = pagination;

    const results = await this.model.query()
    .withGraphJoined('silo')
    .withGraphJoined('asset')
    .where(function (this: QueryBuilder<BorrowEventModel>) {
      this.where('silo.name', siloName);
    }).orderBy('block_number', 'DESC').page(page - 1, perPage);

    return this.parserResult(new Pagination(results, perPage, page), transformer);
  }

}

export default new BorrowEventRepository();