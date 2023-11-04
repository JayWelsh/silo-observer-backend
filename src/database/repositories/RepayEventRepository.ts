import { QueryBuilder, raw } from "objection";

import { RepayEventModel } from "../models";
import BaseRepository from "./BaseRepository";
import Pagination, { IPaginationRequest } from "../../utils/Pagination";
import { ITransformer } from "../../interfaces";

class RepayEventRepository extends BaseRepository {
  getModel() {
    return RepayEventModel
  }

  async getRepayEvents(
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

  async getRepayEventsDistinctUsersPerDay(
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
        'repay_event.block_number',
      )
      .orderBy('block_day_timestamp', 'DESC')
      .modify(paginationModifier, page, perPage, skipPagination);

    if(!skipPagination) {
      return this.parserResult(new Pagination(results, perPage, page), transformer);
    } else {
      return this.parserResult(results, transformer);
    }
 
  }

  async getRepayEventsBySiloAddress(
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
    .where(function (this: QueryBuilder<RepayEventModel>) {
      this.where('silo_address', siloAddress);
    }).orderBy('block_number', 'DESC').page(page - 1, perPage);

    return this.parserResult(new Pagination(results, perPage, page), transformer);
  }

  async getRepayEventsBySiloName(
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
    .where(function (this: QueryBuilder<RepayEventModel>) {
      this.where('silo.name', siloName);
    }).orderBy('block_number', 'DESC').page(page - 1, perPage);

    return this.parserResult(new Pagination(results, perPage, page), transformer);
  }

  async getDailyRepayTotals(
    pagination: IPaginationRequest,
    order: string,
    transformer: ITransformer,
  ) {

    const { 
      perPage,
      page
    } = pagination;

    const results = await RepayEventModel.query()
      .leftJoinRelated('block_metadata')
      .where(function (this: QueryBuilder<RepayEventModel>) {
        this.where('usd_value_at_event_time', '>', 0);
      })
      .select(raw('SUM(usd_value_at_event_time) AS usd'))
      .select(raw('block_metadata.block_day_timestamp as block_day_timestamp'))
      .orderBy('block_metadata.block_day_timestamp', order === "DESC" ? "DESC" : "ASC")
      .page(page - 1, perPage)
      .groupBy(`block_metadata.block_day_timestamp`);

      return this.parserResult(new Pagination(results, perPage, page), transformer);

  }

  async getRepayEventsSinceDate(
    unixTimestampStartDate: string | number,
  ) {
    const results = await this.model.query()
      .withGraphJoined('block_metadata')
      .where(function (this: QueryBuilder<RepayEventModel>) {
        this.where('block_metadata.block_timestamp_unix', '>=', unixTimestampStartDate);
      })
      .orderBy('block_metadata.block_timestamp_unix', 'ASC')

      return this.parserResult(results);
  }

  async getRepayEventsSinceDateWithNullUsdValue(
    unixTimestampStartDate: string | number,
  ) {
    const results = await this.model.query()
      .withGraphJoined('block_metadata')
      .where(function (this: QueryBuilder<RepayEventModel>) {
        this.where('block_metadata.block_timestamp_unix', '>=', unixTimestampStartDate);
        this.where('usd_value_at_event_time', null);
      })
      .orderBy('block_metadata.block_timestamp_unix', 'ASC')

      return this.parserResult(results);
  }

  async getRepayEventsSinceDateWithZeroUsdValue(
    unixTimestampStartDate: string | number,
  ) {
    const results = await this.model.query()
      .withGraphJoined('block_metadata')
      .where(function (this: QueryBuilder<RepayEventModel>) {
        this.where('block_metadata.block_timestamp_unix', '>=', unixTimestampStartDate);
        this.where('usd_value_at_event_time', 0);
      })
      .orderBy('block_metadata.block_timestamp_unix', 'ASC')

      return this.parserResult(results);
  }

  async getRepayEventsSinceDateWithZeroAssetPriceValue(
    unixTimestampStartDate: string | number,
  ) {
    const results = await this.model.query()
      .withGraphJoined('block_metadata')
      .where(function (this: QueryBuilder<RepayEventModel>) {
        this.where('block_metadata.block_timestamp_unix', '>=', unixTimestampStartDate);
        this.where('asset_price_at_event_time', 0);
      })
      .orderBy('block_metadata.block_timestamp_unix', 'ASC')

      return this.parserResult(results);
  }

  async getRepayEventsSinceDateWithNullAssetPriceValue(
    unixTimestampStartDate: string | number,
  ) {
    const results = await this.model.query()
      .withGraphJoined('block_metadata')
      .where(function (this: QueryBuilder<RepayEventModel>) {
        this.where('block_metadata.block_timestamp_unix', '>=', unixTimestampStartDate);
        this.where('asset_price_at_event_time', null);
      })
      .orderBy('block_metadata.block_timestamp_unix', 'ASC')

      return this.parserResult(results);
  }
}

export default new RepayEventRepository();