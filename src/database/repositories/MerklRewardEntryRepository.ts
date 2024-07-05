import { QueryBuilder, raw } from "objection";

import { MerklRewardEntryModel, AssetModel } from "../models";
import BaseRepository from "./BaseRepository";

import {
  MerklUserRewards,
} from '../../interfaces';

class MerklRewardEntryRepository extends BaseRepository {
  getModel() {
    return MerklRewardEntryModel
  }

  async getCumulativeRewardsPerAddress(
    networks?: string[],
    includeMerklCampaignsByTags?: string[],
    includeUntaggedMerklCampaigns: boolean = false
  ): Promise<Record<string, MerklUserRewards>> {
    const tableName = this.model.tableName;
    const assetTableName = AssetModel.tableName;

    let query = this.model.query()
      .select(
        `${tableName}.user_address`,
        `${tableName}.asset_address`,
        `${tableName}.network`,
        this.model.raw(`SUM(${tableName}.amount) as total_amount`),
        `${assetTableName}.decimals`,
        `${assetTableName}.symbol`
      )
      .join('asset', `${tableName}.asset_address`, '=', `${assetTableName}.address`)
      .groupBy(`${tableName}.user_address`, `${tableName}.asset_address`, `${tableName}.network`);

    if (networks && networks.length > 0) {
      query = query.whereIn(`${tableName}.network`, networks);
    }

    if (includeMerklCampaignsByTags && includeMerklCampaignsByTags.length > 0) {
      const tagConditions = includeMerklCampaignsByTags.map(tag => 
        this.model.raw("? = ANY(campaign_tags)", [tag])
      );
      query = query.where((qb: QueryBuilder<MerklRewardEntryModel, MerklRewardEntryModel[]>) => {
        qb.where(tagConditions[0]);
        for (let i = 1; i < tagConditions.length; i++) {
          qb.orWhere(tagConditions[i]);
        }
      });
    }

    if (includeUntaggedMerklCampaigns) {
      query = query.orWhere((qb: QueryBuilder<MerklRewardEntryModel, MerklRewardEntryModel[]>) => {
        qb.whereNull('campaign_tags')
          .orWhereRaw('array_length(campaign_tags, 1) = 0')
          .orWhere('campaign_tags', '{}');
      });
    }

    const results = await query;

    const cumulativeRewards: Record<string, MerklUserRewards> = {};

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
    }

    return cumulativeRewards;
  }

  async getUniqueTags() {

    const resultRaw = await this.model.query()
    .distinct(this.model.raw('unnest(campaign_tags) as tag'))
    .orderBy('tag');

    let result = resultRaw.map((entry: {tag: string}) => entry.tag);

    return result;

  }
}

export default new MerklRewardEntryRepository();