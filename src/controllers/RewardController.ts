import e, { Request, Response } from 'express';

import {
  RewardEventRepository,
  MerklRewardEntryRepository,
} from '../database/repositories';

import {
  MerklUserRewards,
} from '../interfaces';

import Controller from './Controller';

type RewardEntry = {
  asset_address: string;
  amount: string;
  decimals: string;
  symbol: string;
};

type NetworkRewards = {
  [network: string]: RewardEntry[];
};

type AddressRewards = {
  [address: string]: NetworkRewards;
};

function mergeRewards(...rewardObjects: Record<string, MerklUserRewards>[]): Record<string, MerklUserRewards> {
  const merged: Record<string, MerklUserRewards> = {};

  for (let rewardObject of rewardObjects) {
    for (let [userAddress, networks] of Object.entries(rewardObject)) {
      if (!merged[userAddress]) merged[userAddress] = {};

      for (let [network, rewards] of Object.entries(networks)) {
        if (!merged[userAddress][network]) merged[userAddress][network] = [];

        for (let reward of rewards) {
          const existingReward = merged[userAddress][network].find(r => r.asset_address === reward.asset_address);
          if (existingReward) {
            existingReward.amount = (BigInt(existingReward.amount) + BigInt(reward.amount)).toString();
          } else {
            merged[userAddress][network].push({...reward});
          }
        }
      }
    }
  }

  return merged;
}

class RewardController extends Controller {
  async getCumulativeRewards(req: Request, res: Response) {
    let {
      networks,
      versions,
      excludeOnchainRewards,
      includeMerklCampaignsByTags,
      includeUntaggedMerklCampaigns,
    } = req.query;
  
    networks = networks as string;
    versions = versions as string;
    let useExcludeOnchainRewards = excludeOnchainRewards === 'true';
    let useIncludeUntaggedMerklCampaigns = includeUntaggedMerklCampaigns === 'true';
  
    let parsedNetworks: string[] = networks ? networks.split(',') : [];
    let parsedVersions: string[] = versions ? versions.split(',') : [];
    let parsedTags: string[] | undefined = includeMerklCampaignsByTags ? (includeMerklCampaignsByTags as string).split(',') : undefined;
  
    let mergedRewards: Record<string, MerklUserRewards> = {};
  
    if (!useExcludeOnchainRewards) {
      let onChainRewardEvents = await RewardEventRepository.getCumulativeRewardsPerAddress(
        parsedNetworks,
        parsedVersions
      );
      mergedRewards = mergeRewards(mergedRewards, onChainRewardEvents);
    }
  
    if(includeMerklCampaignsByTags || useIncludeUntaggedMerklCampaigns) {
      let merklRewardEntries = await MerklRewardEntryRepository.getCumulativeRewardsPerAddress(
        parsedNetworks,
        parsedTags,
        useIncludeUntaggedMerklCampaigns,
      );
      mergedRewards = mergeRewards(mergedRewards, merklRewardEntries);
    }
  
    this.sendResponse(res, mergedRewards);
  }

  async getMerklTags(req: Request, res: Response) {
    let merklTags = await MerklRewardEntryRepository.getUniqueTags();

    this.sendResponse(res, 
      { tags: merklTags }
    );
  }
}

export default RewardController;