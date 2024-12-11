import { QueryBuilder, raw } from "objection";

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
    .withGraphJoined('block_metadata')
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

  async getDailyLiquidationTotals(
    pagination: IPaginationRequest,
    order: string,
    period: string | undefined,
    networks: string[] | undefined,
    transformer: ITransformer,
  ) {

    const { 
      perPage,
      page
    } = pagination;

    const results = await SubgraphLiquidationRecordModel.query()
      .leftJoinRelated('block_metadata')
      .where(function (this: QueryBuilder<SubgraphLiquidationRecordModel>) {
        this.where('amount_usd', '>', 0);
        if(period === "today") {
          let now = new Date();
          now.setHours(0,0,0,0);
          let todayTimestamp = now.toISOString();
          this.where('block_metadata.block_day_timestamp', '=', todayTimestamp);
        }
      })
      .where(function (this: QueryBuilder<SubgraphLiquidationRecordModel>) {
        if(networks) {
          for(let [index, network] of networks.entries()) {
            if(index === 0) {
              this.where('block_metadata.network', '=', network);
            } else {
              this.orWhere('block_metadata.network', '=', network);
            }
          }
        }
      })
      .select(raw('SUM(amount_usd) AS usd'))
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

  async getDailyLiquidationTotalsGroupedByNetwork(
    pagination: IPaginationRequest,
    order: string,
    period: string | undefined,
    networks: string[] | undefined,
    transformer: ITransformer,
  ) {
    const { 
      perPage,
      page
    } = pagination;
  
    const results = await SubgraphLiquidationRecordModel.query()
      .leftJoinRelated('block_metadata')
      .where(function (this: QueryBuilder<SubgraphLiquidationRecordModel>) {
        this.where('amount_usd', '>', 0);
        if(period === "today") {
          let now = new Date();
          now.setHours(0,0,0,0);
          let todayTimestamp = now.toISOString();
          this.where('block_metadata.block_day_timestamp', '=', todayTimestamp);
        }
      })
      .where(function (this: QueryBuilder<SubgraphLiquidationRecordModel>) {
        if(networks) {
          for(let [index, network] of networks.entries()) {
            if(index === 0) {
              this.where('block_metadata.network', '=', network);
            } else {
              this.orWhere('block_metadata.network', '=', network);
            }
          }
        }
      })
      .select(raw('SUM(amount_usd) AS usd'))  // Changed from usd_value_at_event_time
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
  
      if(networks && networks.length > 0) {
        const shimRecords = networks.map(network => ({
          block_day_timestamp: todayTimestamp,
          usd: "0",
          network: network
        }));
  
        if(order === "DESC") {
          const existingNetworks = new Set(
            results.results
              .filter(r => r.block_day_timestamp === todayTimestamp)
              .map(r => r.network)
          );
  
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
}

export default new SubgraphLiquidationRecordRepository();