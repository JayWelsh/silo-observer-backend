import { QueryBuilder, raw } from "objection";

import { WithdrawEventModel } from "../models";
import BaseRepository from "./BaseRepository";
import Pagination, { IPaginationRequest } from "../../utils/Pagination";
import { ITransformer } from "../../interfaces";

class WithdrawEventRepository extends BaseRepository {
  getModel() {
    return WithdrawEventModel
  }

  async getWithdrawEvents(
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

  async getWithdrawEventsDistinctUsersPerDay(
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
        'withdraw_event.block_number',
      )
      .orderBy('block_day_timestamp', 'DESC')
      .modify(paginationModifier, page, perPage, skipPagination);

    if(!skipPagination) {
      return this.parserResult(new Pagination(results, perPage, page), transformer);
    } else {
      return this.parserResult(results, transformer);
    }
 
  }

  async getWithdrawEventsBySiloAddress(
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
    .where(function (this: QueryBuilder<WithdrawEventModel>) {
      this.where('silo_address', siloAddress);
    }).orderBy('block_number', 'DESC').page(page - 1, perPage);

    return this.parserResult(new Pagination(results, perPage, page), transformer);
  }

  async getWithdrawEventsBySiloName(
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
    .where(function (this: QueryBuilder<WithdrawEventModel>) {
      this.where('silo.name', siloName);
    }).orderBy('block_number', 'DESC').page(page - 1, perPage);

    return this.parserResult(new Pagination(results, perPage, page), transformer);
  }

  async getDailyWithdrawTotals(
    pagination: IPaginationRequest,
    transformer: ITransformer,
  ) {

    const { 
      perPage,
      page
    } = pagination;

    const results = await WithdrawEventModel.query()
      .leftJoinRelated('block_metadata')
      .where(function (this: QueryBuilder<WithdrawEventModel>) {
        this.where('usd_value_at_event_time', '>', 0);
      })
      .select(raw('SUM(usd_value_at_event_time) AS usd'))
      .select(raw('block_metadata.block_day_timestamp as block_day_timestamp'))
      .groupBy(`block_metadata.block_day_timestamp`)
      .page(page - 1, perPage);

      return this.parserResult(new Pagination(results, perPage, page), transformer);

  }

  async getWithdrawEventsSinceDate(
    unixTimestampStartDate: string | number,
  ) {
    const results = await this.model.query()
      .withGraphJoined('block_metadata')
      .where(function (this: QueryBuilder<WithdrawEventModel>) {
        this.where('block_metadata.block_timestamp_unix', '>=', unixTimestampStartDate);
      })
      .orderBy('block_metadata.block_timestamp_unix', 'ASC')

      return this.parserResult(results);
  }

  async getWithdrawEventsSinceDateWithNullUsdValue(
    unixTimestampStartDate: string | number,
  ) {
    const results = await this.model.query()
      .withGraphJoined('block_metadata')
      .where(function (this: QueryBuilder<WithdrawEventModel>) {
        this.where('block_metadata.block_timestamp_unix', '>=', unixTimestampStartDate);
        this.where('usd_value_at_event_time', null);
      })
      .orderBy('block_metadata.block_timestamp_unix', 'ASC')

      return this.parserResult(results);
  }

  async getWithdrawEventsSinceDateWithZeroUsdValue(
    unixTimestampStartDate: string | number,
  ) {
    const results = await this.model.query()
      .withGraphJoined('block_metadata')
      .where(function (this: QueryBuilder<WithdrawEventModel>) {
        this.where('block_metadata.block_timestamp_unix', '>=', unixTimestampStartDate);
        this.where('usd_value_at_event_time', 0);
      })
      .orderBy('block_metadata.block_timestamp_unix', 'ASC')

      return this.parserResult(results);
  }

  async getWithdrawEventsSinceDateWithZeroAssetPriceValue(
    unixTimestampStartDate: string | number,
  ) {
    const results = await this.model.query()
      .withGraphJoined('block_metadata')
      .where(function (this: QueryBuilder<WithdrawEventModel>) {
        this.where('block_metadata.block_timestamp_unix', '>=', unixTimestampStartDate);
        this.where('asset_price_at_event_time', 0);
      })
      .orderBy('block_metadata.block_timestamp_unix', 'ASC')

      return this.parserResult(results);
  }

  async getWithdrawEventsSinceDateWithNullAssetPriceValue(
    unixTimestampStartDate: string | number,
  ) {
    const results = await this.model.query()
      .withGraphJoined('block_metadata')
      .where(function (this: QueryBuilder<WithdrawEventModel>) {
        this.where('block_metadata.block_timestamp_unix', '>=', unixTimestampStartDate);
        this.where('asset_price_at_event_time', null);
      })
      .orderBy('block_metadata.block_timestamp_unix', 'ASC')

      return this.parserResult(results);
  }
}

export default new WithdrawEventRepository();