import { QueryBuilder, raw } from "objection";

import { 
  BorrowEventModel,
  DepositEventModel,
  WithdrawEventModel,
  RepayEventModel,
  SubgraphLiquidationRecordModel,
} from "../models";
import BaseRepository from "./BaseRepository";
import Pagination, { IPaginationRequest } from "../../utils/Pagination";
import { ITransformer, IVolumeTimeseriesQueryResult } from "../../interfaces";

class BorrowEventRepository extends BaseRepository {
  getModel() {
    return BorrowEventModel
  }

  async getBorrowEvents(
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
    .where(function (this: QueryBuilder<BorrowEventModel>) {
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
    .orderBy('block_metadata.block_timestamp_unix', 'DESC').page(page - 1, perPage);

    return this.parserResult(new Pagination(results, perPage, page), transformer);
  }

  async getUnifiedEvents(
    pagination: IPaginationRequest,
    networks: string[] | undefined,
    transformer: ITransformer,
  ) {

    const { 
      perPage,
      page
    } = pagination;

    let tableName = this.model.tableName;

    let columnsForSelection = (tableName: string) => {
      return ["event_name", "amount", "usd_value_at_event_time", "tx_hash", "gas_used", "effective_gas_price", "user_address", "event_fingerprint", `${tableName}.deployment_id`];
    }

    const results = await this.model.query()
    .select(columnsForSelection(tableName))
    .withGraphJoined('silo')
    .withGraphJoined('asset')
    .withGraphJoined('block_metadata')
    .union(
      RepayEventModel.query()
      .select(columnsForSelection(RepayEventModel.tableName))
      .withGraphJoined('silo')
      .withGraphJoined('asset')
      .withGraphJoined('block_metadata')
      .where(function (this: QueryBuilder<RepayEventModel>) {
        if(networks) {
          this.whereIn(`${RepayEventModel.tableName}.network`, networks);
        }
      })
    )
    .union(
      DepositEventModel.query()
      .select(columnsForSelection(DepositEventModel.tableName))
      .withGraphJoined('silo')
      .withGraphJoined('asset')
      .withGraphJoined('block_metadata')
      .where(function (this: QueryBuilder<DepositEventModel>) {
        if(networks) {
          this.whereIn(`${DepositEventModel.tableName}.network`, networks);
        }
      })
    )
    .union(
      WithdrawEventModel.query()
      .select(columnsForSelection(WithdrawEventModel.tableName))
      .withGraphJoined('silo')
      .withGraphJoined('asset')
      .withGraphJoined('block_metadata')
      .where(function (this: QueryBuilder<WithdrawEventModel>) {
        if(networks) {
          this.whereIn(`${WithdrawEventModel.tableName}.network`, networks);
        }
      })
    )
    .union(
      SubgraphLiquidationRecordModel.query()
      .select(columnsForSelection(SubgraphLiquidationRecordModel.tableName))
      .withGraphJoined('silo')
      .withGraphJoined('asset')
      .withGraphJoined('block_metadata')
      .where(function (this: QueryBuilder<SubgraphLiquidationRecordModel>) {
        if(networks) {
          this.whereIn(`${SubgraphLiquidationRecordModel.tableName}.network`, networks);
        }
      })
    )
    .where(function (this: QueryBuilder<BorrowEventModel>) {
      if(networks) {
        this.whereIn(`${tableName}.network`, networks);
      }
    })
    .orderBy('block_metadata:block_timestamp_unix', 'DESC')
    .page(page - 1, perPage);

    return this.parserResult(new Pagination(results, perPage, page), transformer);
  }

  async getBorrowEventsDistinctUsersPerDay(
    pagination: IPaginationRequest,
    networks: string[] | undefined,
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
      .where(function (this: QueryBuilder<BorrowEventModel>) {
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

  async getDailyBorrowTotals(
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

    const results = await BorrowEventModel.query()
      .leftJoinRelated('block_metadata')
      .where(function (this: QueryBuilder<BorrowEventModel>) {
        this.where('usd_value_at_event_time', '>', 0);
        if(period === "today") {
          let now = new Date();
          now.setHours(0,0,0,0);
          let todayTimestamp = now.toISOString();
          this.where('block_metadata.block_day_timestamp', '=', todayTimestamp);
        }
      })
      .where(function (this: QueryBuilder<BorrowEventModel>) {
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

  async getDailyBorrowTotalsGroupedByNetwork(
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

    const results = await BorrowEventModel.query()
      .leftJoinRelated('block_metadata')
      .where(function (this: QueryBuilder<BorrowEventModel>) {
        this.where('usd_value_at_event_time', '>', 0);
        if(period === "today") {
          let now = new Date();
          now.setHours(0,0,0,0);
          let todayTimestamp = now.toISOString();
          this.where('block_metadata.block_day_timestamp', '=', todayTimestamp);
        }
      })
      .where(function (this: QueryBuilder<BorrowEventModel>) {
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

  async getBorrowEventsSinceDate(
    unixTimestampStartDate: string | number,
  ) {
    const results = await this.model.query()
      .withGraphJoined('block_metadata')
      .where(function (this: QueryBuilder<BorrowEventModel>) {
        this.where('block_metadata.block_timestamp_unix', '>=', unixTimestampStartDate);
      })
      .orderBy('block_metadata.block_timestamp_unix', 'ASC')

      return this.parserResult(results);
  }

  async getBorrowEventsSinceDateWithNullUsdValue(
    unixTimestampStartDate: string | number,
  ) {
    const results = await this.model.query()
      .withGraphJoined('block_metadata')
      .where(function (this: QueryBuilder<BorrowEventModel>) {
        this.where('block_metadata.block_timestamp_unix', '>=', unixTimestampStartDate);
        this.where('usd_value_at_event_time', null);
      })
      .orderBy('block_metadata.block_timestamp_unix', 'ASC')

      return this.parserResult(results);
  }

  async getBorrowEventsSinceDateWithZeroUsdValue(
    unixTimestampStartDate: string | number,
  ) {
    const results = await this.model.query()
      .withGraphJoined('block_metadata')
      .where(function (this: QueryBuilder<BorrowEventModel>) {
        this.where('block_metadata.block_timestamp_unix', '>=', unixTimestampStartDate);
        this.where('usd_value_at_event_time', 0);
      })
      .orderBy('block_metadata.block_timestamp_unix', 'ASC')

      return this.parserResult(results);
  }

  async getBorrowEventsSinceDateWithZeroAssetPriceValue(
    unixTimestampStartDate: string | number,
  ) {
    const results = await this.model.query()
      .withGraphJoined('block_metadata')
      .where(function (this: QueryBuilder<BorrowEventModel>) {
        this.where('block_metadata.block_timestamp_unix', '>=', unixTimestampStartDate);
        this.where('asset_price_at_event_time', 0);
      })
      .orderBy('block_metadata.block_timestamp_unix', 'ASC')

      return this.parserResult(results);
  }

  async getBorrowEventsSinceDateWithNullAssetPriceValue(
    unixTimestampStartDate: string | number,
  ) {
    const results = await this.model.query()
      .withGraphJoined('block_metadata')
      .where(function (this: QueryBuilder<BorrowEventModel>) {
        this.where('block_metadata.block_timestamp_unix', '>=', unixTimestampStartDate);
        this.where('asset_price_at_event_time', null);
      })
      .orderBy('block_metadata.block_timestamp_unix', 'ASC')

      return this.parserResult(results);
  }

}

export default new BorrowEventRepository();