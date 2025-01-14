import { QueryBuilder, raw } from "objection";

import { RewardEventModel, AssetModel } from "../models";
import BaseRepository from "./BaseRepository";
import Pagination, { IPaginationRequest } from "../../utils/Pagination";
import { ITransformer, IVolumeTimeseriesQueryResult } from "../../interfaces";

type AssetReward = {
  asset_address: string;
  amount: string;
  decimals: string;
  symbol: string;
};

type UserRewards = Record<string, AssetReward[]>;

class RewardEventRepository extends BaseRepository {
  getModel() {
    return RewardEventModel
  }

  async getRewardEvents(
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
    .withGraphJoined('asset')
    .withGraphJoined('block_metadata')
    .where(function (this: QueryBuilder<RewardEventModel>) {
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

  async getRewardEventsDistinctUsersPerDay(
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
      .where(function (this: QueryBuilder<RewardEventModel>) {
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
        'rewards_claimed_event.block_number',
      )
      .orderBy('block_day_timestamp', 'DESC')
      .modify(paginationModifier, page, perPage, skipPagination);

    if(!skipPagination) {
      return this.parserResult(new Pagination(results, perPage, page), transformer);
    } else {
      return this.parserResult(results, transformer);
    }
  }

  async getDailyRewardsClaimedTotals(
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

    const results = await RewardEventModel.query()
      .leftJoinRelated('block_metadata')
      .where(function (this: QueryBuilder<RewardEventModel>) {
        this.where('usd_value_at_event_time', '>', 0);
        if(period === "today") {
          let now = new Date();
          now.setHours(0,0,0,0);
          let todayTimestamp = now.toISOString();
          this.where('block_metadata.block_day_timestamp', '=', todayTimestamp);
        }
      })
      .where(function (this: QueryBuilder<RewardEventModel>) {
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

  async getRewardEventsSinceDate(
    unixTimestampStartDate: string | number,
  ) {
    const results = await this.model.query()
      .withGraphJoined('block_metadata')
      .where(function (this: QueryBuilder<RewardEventModel>) {
        this.where('block_metadata.block_timestamp_unix', '>=', unixTimestampStartDate);
      })
      .orderBy('block_metadata.block_timestamp_unix', 'ASC')

    return this.parserResult(results);
  }

  async getRewardEventsSinceDateWithNullUsdValue(
    unixTimestampStartDate: string | number,
  ) {
    const results = await this.model.query()
      .withGraphJoined('block_metadata')
      .where(function (this: QueryBuilder<RewardEventModel>) {
        this.where('block_metadata.block_timestamp_unix', '>=', unixTimestampStartDate);
        this.where('usd_value_at_event_time', null);
      })
      .orderBy('block_metadata.block_timestamp_unix', 'ASC')

    return this.parserResult(results);
  }

  async getRewardEventsSinceDateWithZeroUsdValue(
    unixTimestampStartDate: string | number,
  ) {
    const results = await this.model.query()
      .withGraphJoined('block_metadata')
      .where(function (this: QueryBuilder<RewardEventModel>) {
        this.where('block_metadata.block_timestamp_unix', '>=', unixTimestampStartDate);
        this.where('usd_value_at_event_time', 0);
      })
      .orderBy('block_metadata.block_timestamp_unix', 'ASC')

    return this.parserResult(results);
  }

  async getRewardEventsSinceDateWithZeroAssetPriceValue(
    unixTimestampStartDate: string | number,
  ) {
    const results = await this.model.query()
      .withGraphJoined('block_metadata')
      .where(function (this: QueryBuilder<RewardEventModel>) {
        this.where('block_metadata.block_timestamp_unix', '>=', unixTimestampStartDate);
        this.where('asset_price_at_event_time', 0);
      })
      .orderBy('block_metadata.block_timestamp_unix', 'ASC')

    return this.parserResult(results);
  }

  async getRewardEventsSinceDateWithNullAssetPriceValue(
    unixTimestampStartDate: string | number,
  ) {
    const results = await this.model.query()
      .withGraphJoined('block_metadata')
      .where(function (this: QueryBuilder<RewardEventModel>) {
        this.where('block_metadata.block_timestamp_unix', '>=', unixTimestampStartDate);
        this.where('asset_price_at_event_time', null);
      })
      .orderBy('block_metadata.block_timestamp_unix', 'ASC')

    return this.parserResult(results);
  }

  async getCumulativeRewardsPerAddress(
    networks?: string[],
    versions?: string[]
  ): Promise<Record<string, UserRewards>> {
    let tableName = this.model.tableName;
    let assetTableName = AssetModel.tableName;
  
    const results = await this.model.query()
      .select(
        `${tableName}.user_address`,
        `${tableName}.asset_address`,
        `${tableName}.network`,
        `${tableName}.protocol_version`,
        this.model.raw(`SUM(${tableName}.amount) as total_amount`),
        this.model.raw(`MAX(${assetTableName}.decimals) as decimals`),
        this.model.raw(`MAX(${assetTableName}.symbol) as symbol`),
      )
      .join('asset', `${tableName}.asset_address`, '=', `${assetTableName}.address`)
      .groupBy(`${tableName}.user_address`, `${tableName}.asset_address`, `${tableName}.network`)
      .modify((queryBuilder: QueryBuilder<RewardEventModel>) => {
        if (networks && networks.length > 0) {
          queryBuilder.whereIn(`${tableName}.network`, networks);
        }
        if (versions && versions.length > 0) {
          queryBuilder.whereIn(`${tableName}.protocol_version`, versions);
        }
      });
  
    const cumulativeRewards: Record<string, UserRewards> = {};
  
    for(let result of results) {
      const { user_address, asset_address, network, total_amount, decimals, symbol } = result;
      
      if (!cumulativeRewards[user_address]) {
        cumulativeRewards[user_address] = {};
      }
      
      if (!cumulativeRewards[user_address][network]) {
        cumulativeRewards[user_address][network] = [];
      }
      
      cumulativeRewards[user_address][network].push({
        asset_address,
        amount: total_amount.toString(),
        decimals: decimals.toString(),
        symbol
      });
    };
  
    return cumulativeRewards;
  }
}

export default new RewardEventRepository();