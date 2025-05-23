import { QueryBuilder, raw } from "objection";

import { DepositEventModel } from "../models";
import BaseRepository from "./BaseRepository";
import Pagination, { IPaginationRequest } from "../../utils/Pagination";
import { ITransformer, IVolumeTimeseriesQueryResult } from "../../interfaces";

class DepositEventRepository extends BaseRepository {
  getModel() {
    return DepositEventModel
  }

  async getDepositEvents(
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
    .withGraphJoined('silo')
    .withGraphJoined('asset')
    .withGraphJoined('block_metadata')
    .where(function (this: QueryBuilder<DepositEventModel>) {
      if(networks) {
        this.whereIn(`${tableName}.network`, networks);
      }
      if(versions) {
        this.whereIn(`${tableName}.protocol_version`, versions);
      }
    })
    .orderBy('block_metadata.block_timestamp_unix', 'DESC').page(page - 1, perPage);

    return this.parserResult(new Pagination(results, perPage, page), transformer);
  }

  async getDepositEventsDistinctUsersPerDay(
    pagination: IPaginationRequest,
    networks: string[] | undefined,
    versions: string[] | undefined,
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

    let tableName = this.model.tableName;

    const results = await this.model.query()
      .select(raw('DISTINCT user_address, block_metadata.block_day_timestamp'))
      .where(function (this: QueryBuilder<DepositEventModel>) {
        if(networks) {
          this.whereIn(`${tableName}.network`, networks);
        }
        if(versions) {
          this.whereIn(`${tableName}.protocol_version`, versions);
        }
      })
      .leftJoin(
        'block_metadata',
        'block_metadata.block_number',
        'deposit_event.block_number',
      )
      .orderBy('block_day_timestamp', 'DESC')
      .modify(paginationModifier, page, perPage, skipPagination);

    if(!skipPagination) {
      return this.parserResult(new Pagination(results, perPage, page), transformer);
    } else {
      return this.parserResult(results, transformer);
    }
  }

  async getDepositEventsBySiloAddress(
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
    .where(function (this: QueryBuilder<DepositEventModel>) {
      this.where('silo_address', siloAddress);
    }).orderBy('block_number', 'DESC').page(page - 1, perPage);

    return this.parserResult(new Pagination(results, perPage, page), transformer);
  }

  async getDepositEventsBySiloName(
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
    .where(function (this: QueryBuilder<DepositEventModel>) {
      this.where('silo.name', siloName);
    }).orderBy('block_number', 'DESC').page(page - 1, perPage);

    return this.parserResult(new Pagination(results, perPage, page), transformer);
  }

  async getDailyDepositTotals(
    pagination: IPaginationRequest,
    order: string,
    period: string | undefined,
    networks: string[] | undefined,
    versions: string[] | undefined,
    transformer: ITransformer,
  ) {
    const { 
      perPage,
      page
    } = pagination;

    const results = await DepositEventModel.query()
      .leftJoinRelated('block_metadata')
      .where(function (this: QueryBuilder<DepositEventModel>) {
        this.where('usd_value_at_event_time', '>', 0);
        if(period === "today") {
          let now = new Date();
          now.setHours(0,0,0,0);
          let todayTimestamp = now.toISOString();
          this.where('block_metadata.block_day_timestamp', '=', todayTimestamp);
        }
      })
      .where(function (this: QueryBuilder<DepositEventModel>) {
        if(networks) {
          this.whereIn(`block_metadata.network`, networks);
        }
        if(versions) {
          this.whereIn(`protocol_version`, versions);
        }
      })
      .select(raw('SUM(usd_value_at_event_time) AS usd'))
      .select(raw('block_metadata.block_day_timestamp as block_day_timestamp'))
      .orderBy('block_metadata.block_day_timestamp', order === "DESC" ? "DESC" : "ASC")
      .page(page - 1, perPage)
      .groupBy(`block_metadata.block_day_timestamp`)
      .castTo<IVolumeTimeseriesQueryResult>();

    if((results?.results) && (period === "today")) {
      let now = new Date();
      now.setHours(0,0,0,0);
      let todayTimestamp = now.toISOString();
      let shimRecord = {
        block_day_timestamp: todayTimestamp,
        usd: "0",
      }
      if(order === "DESC") {
        // Check that the first record is for today
        let firstRecord = results?.results[0];
        let hasTodayRecord = new Date(firstRecord.block_day_timestamp).toISOString() === todayTimestamp;
        if(!firstRecord || !hasTodayRecord) {
          results.results = [shimRecord, ...results?.results];
          results.total = results.total + 1;
        }
      }
    }

    return this.parserResult(new Pagination(results, perPage, page), transformer);

  }

  async getDailyDepositTotalsGroupedByNetwork(
    pagination: IPaginationRequest,
    order: string,
    period: string | undefined,
    networks: string[] | undefined,
    versions: string[] | undefined,
    transformer: ITransformer,
  ) {
    const { 
      perPage,
      page
    } = pagination;
  
    const results = await DepositEventModel.query()
      .leftJoinRelated('block_metadata')
      .where(function (this: QueryBuilder<DepositEventModel>) {
        this.where('usd_value_at_event_time', '>', 0);
        if(period === "today") {
          let now = new Date();
          now.setHours(0,0,0,0);
          let todayTimestamp = now.toISOString();
          this.where('block_metadata.block_day_timestamp', '=', todayTimestamp);
        }
      })
      .where(function (this: QueryBuilder<DepositEventModel>) {
        if(networks) {
          this.whereIn(`block_metadata.network`, networks);
        }
        if(versions) {
          this.whereIn(`protocol_version`, versions);
        }
      })
      .select(raw('SUM(usd_value_at_event_time) AS usd'))
      .select(raw('block_metadata.block_day_timestamp as block_day_timestamp'))
      .select('block_metadata.network')
      .orderBy('block_metadata.block_day_timestamp', order === "DESC" ? "DESC" : "ASC")
      .page(page - 1, perPage)
      .groupBy(`block_metadata.block_day_timestamp`, 'block_metadata.network')
      .castTo<IVolumeTimeseriesQueryResult>();
  
    if((results?.results) && (period === "today")) {
      let now = new Date();
      now.setHours(0,0,0,0);
      let todayTimestamp = now.toISOString();
  
      // If networks are specified, create shim records for each network
      if(networks && networks.length > 0) {
        const shimRecords = networks.map(network => ({
          block_day_timestamp: todayTimestamp,
          usd: "0",
          network: network
        }));
  
        if(order === "DESC") {
          // Get unique networks from the first day's results
          const existingNetworks = new Set(
            results.results
              .filter(r => r.block_day_timestamp === todayTimestamp)
              .map(r => r.network)
          );
  
          // Only add shim records for networks that don't have data
          const missingShimRecords = shimRecords.filter(sr => !existingNetworks.has(sr.network));
          
          if(missingShimRecords.length > 0) {
            results.results = [...missingShimRecords, ...results.results];
            results.total = results.total + missingShimRecords.length;
          }
        }
      }
    }
  
    return this.parserResult(new Pagination(results, perPage, page), transformer);
  }

  async getDepositEventsSinceDate(
    unixTimestampStartDate: string | number,
  ) {
    const results = await this.model.query()
      .withGraphJoined('block_metadata')
      .where(function (this: QueryBuilder<DepositEventModel>) {
        this.where('block_metadata.block_timestamp_unix', '>=', unixTimestampStartDate);
      })
      .orderBy('block_metadata.block_timestamp_unix', 'ASC')

    return this.parserResult(results);
  }

  async getDepositEventsSinceDateWithNullUsdValue(
    unixTimestampStartDate: string | number,
  ) {
    const results = await this.model.query()
      .withGraphJoined('block_metadata')
      .where(function (this: QueryBuilder<DepositEventModel>) {
        this.where('block_metadata.block_timestamp_unix', '>=', unixTimestampStartDate);
        this.where('usd_value_at_event_time', null);
      })
      .orderBy('block_metadata.block_timestamp_unix', 'ASC')

    return this.parserResult(results);
  }

  async getDepositEventsSinceDateWithZeroUsdValue(
    unixTimestampStartDate: string | number,
  ) {
    const results = await this.model.query()
      .withGraphJoined('block_metadata')
      .where(function (this: QueryBuilder<DepositEventModel>) {
        this.where('block_metadata.block_timestamp_unix', '>=', unixTimestampStartDate);
        this.where('usd_value_at_event_time', 0);
      })
      .orderBy('block_metadata.block_timestamp_unix', 'ASC')

    return this.parserResult(results);
  }

  async getDepositEventsSinceDateWithZeroAssetPriceValue(
    unixTimestampStartDate: string | number,
  ) {
    const results = await this.model.query()
      .withGraphJoined('block_metadata')
      .where(function (this: QueryBuilder<DepositEventModel>) {
        this.where('block_metadata.block_timestamp_unix', '>=', unixTimestampStartDate);
        this.where('asset_price_at_event_time', 0);
      })
      .orderBy('block_metadata.block_timestamp_unix', 'ASC')

    return this.parserResult(results);
  }

  async getDepositEventsSinceDateWithNullAssetPriceValue(
    unixTimestampStartDate: string | number,
  ) {
    const results = await this.model.query()
      .withGraphJoined('block_metadata')
      .where(function (this: QueryBuilder<DepositEventModel>) {
        this.where('block_metadata.block_timestamp_unix', '>=', unixTimestampStartDate);
        this.where('asset_price_at_event_time', null);
      })
      .orderBy('block_metadata.block_timestamp_unix', 'ASC')

    return this.parserResult(results);
  }
}

export default new DepositEventRepository();