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

function mergeRewards(rewards1: AddressRewards, rewards2: AddressRewards): AddressRewards {
  const mergedRewards: AddressRewards = JSON.parse(JSON.stringify(rewards1));

  for (const [address, networkRewards] of Object.entries(rewards2)) {
    if (!mergedRewards[address]) {
      mergedRewards[address] = {};
    }

    for (const [network, rewards] of Object.entries(networkRewards)) {
      if (!mergedRewards[address][network]) {
        mergedRewards[address][network] = [];
      }

      for (const reward of rewards) {
        const existingReward = mergedRewards[address][network].find(
          r => r.asset_address === reward.asset_address
        );

        if (existingReward) {
          existingReward.amount = (BigInt(existingReward.amount) + BigInt(reward.amount)).toString();
        } else {
          mergedRewards[address][network].push({ ...reward });
        }
      }
    }
  }

  return mergedRewards;
}

class RewardController extends Controller {
  async getCumulativeRewards(req: Request, res: Response) {
    let {
      networks,
      excludeOnchainRewards,
      includeMerklCampaignsByTags,
      includeUntaggedMerklCampaigns,
    } = req.query;
  
    networks = networks as string;
    let useExcludeOnchainRewards = excludeOnchainRewards === 'true';
    let useIncludeUntaggedMerklCampaigns = includeUntaggedMerklCampaigns === 'true';
  
    let parsedNetworks: string[] = networks ? networks.split(',') : [];
    let parsedTags: string[] | undefined = includeMerklCampaignsByTags ? (includeMerklCampaignsByTags as string).split(',') : undefined;
  
    let mergedRewards: Record<string, MerklUserRewards> = {};
  
    if (!useExcludeOnchainRewards) {
      let onChainRewardEvents = await RewardEventRepository.getCumulativeRewardsPerAddress(parsedNetworks);
      mergedRewards = mergeRewards(mergedRewards, onChainRewardEvents);
    }
  
    if(includeMerklCampaignsByTags || useIncludeUntaggedMerklCampaigns) {
      let merklRewardEntries = await MerklRewardEntryRepository.getCumulativeRewardsPerAddress(
        parsedNetworks,
        parsedTags,
        useIncludeUntaggedMerklCampaigns
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