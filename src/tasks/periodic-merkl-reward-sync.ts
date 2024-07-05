import { Contract as MulticallContract } from '@kargakis/ethers-multicall';

import axios from 'axios';

import BigNumber from 'bignumber.js';

import { utils } from "ethers";

BigNumber.config({ EXPONENTIAL_AT: [-1e+9, 1e+9] });

import {
  sleep,
} from '../utils';

import {
  CHAIN_ID_TO_CHAIN_NAME,
} from '../constants';

import {
  MerklRewardEntryRepository,
  AssetRepository,
} from '../database/repositories';

import ERC20ABI from '../web3/abis/ERC20ABI.json';

import {
  multicallProviderRetryOnFailure,
} from '../web3/utils';

interface IMerkleAPIResponseCampaign {
  [chainId: string]: {
    [mainParameter: string]: {
      [campaignId: string]: Campaign;
    };
  };
}

interface Campaign {
  chainId: number;
  index: number;
  campaignId: string;
  creator: string;
  campaignType: number;
  campaignSubType: number;
  rewardToken: string;
  amount: string;
  amountDecimal: string;
  startTimestamp: number;
  endTimestamp: number;
  mainParameter: string;
  campaignParameters: CampaignParameters;
  computeChainId: number;
  tags: string[];
  apr: number;
  totalSupplyTargetToken: number;
  tvl: number;
}

interface CampaignParameters {
  duration: number;
  blacklist: string[];
  whitelist: string[];
  forwarders: Forwarder[];
  targetToken: string;
  symbolRewardToken: string;
  symbolTargetToken: string;
  decimalsRewardToken: number;
  decimalsTargetToken: number;
}

interface Forwarder {
  token: string;
  sender: string;
  priority: number;
  forwarderType: number;
  siloAsset: string;
  siloAssetSymbol: string;
}

interface ICampaignRecipients {
  recipient: string;
  reason: string;
  rewardToken: string;
  amount: string;
}

interface IProcessedCampaignData {
  [chainName: string]: {
    [campaignId: string]: ICampaignRecipients[];
  };
}

let merkleRetryMax = 10;
let TIMEOUT_MS = 10000;

const fetchAllRelevantMerklCampaigns = async (retryCount = 0) => {

  let results : IMerkleAPIResponseCampaign = await axios.get(
    `https://api.merkl.xyz/v3/campaigns?chainIds=42161,10,1&types=5`,
    {
      headers: { "Accept-Encoding": "gzip,deflate,compress" },
      timeout: TIMEOUT_MS
    }
  )
  .then(function (response) {
    // handle success
    return response?.data ? response?.data : {};
  })
  .catch(async (e) => {
    retryCount++;
    if(retryCount < merkleRetryMax) {
      console.error(`error in fetchAllRelevantMerklCampaigns at ${Math.floor(new Date().getTime() / 1000)}, retry #${retryCount}...`, e);
      await sleep(5000);
      return await fetchAllRelevantMerklCampaigns(retryCount);
    } else {
      console.error(`retries failed, error in fetchAllRelevantMerklCampaigns at ${Math.floor(new Date().getTime() / 1000)}`, e);
    }
    return {};
  })

  return results;
}

const fetchAllMerklCampaignRecipients = async (chainId: string, campaignId: string, retryCount = 0) => {

  let url = `https://api.merkl.xyz/v3/recipients?chainId=${chainId}&campaignId=${campaignId}`;

  console.log(`Attempting to fetch recipients for ${campaignId} of chain ID ${chainId} via ${url}`)

  let results : ICampaignRecipients[] = await axios.get(
    url,
    {
      headers: { "Accept-Encoding": "gzip,deflate,compress" },
      timeout: TIMEOUT_MS
    }
  )
  .then(function (response) {
    // handle success
    return response?.data ? response?.data : [];
  })
  .catch(async (e) => {
    retryCount++;
    if(retryCount < merkleRetryMax) {
      if (axios.isAxiosError(e) && e.code === 'ECONNABORTED') {
        console.error(`Request timed out after ${TIMEOUT_MS}ms, retrying...`);
      } else {
        console.error(`error in fetchAllMerklCampaignRecipients at ${Math.floor(new Date().getTime() / 1000)}, retry #${retryCount}...`, e);
      }
      await sleep(5000);
      return await fetchAllMerklCampaignRecipients(chainId, campaignId, retryCount);
    } else {
      console.error(`retries failed, error in fetchAllMerklCampaignRecipients at ${Math.floor(new Date().getTime() / 1000)}`, e);
    }
    return [];
  })

  return results;
}

export const merklRewardSync = async (useTimestampUnix: number, startTime: number) => {

  let useTimestampPostgres = new Date(useTimestampUnix * 1000).toISOString();

  try {

    // Get all relevant campaigns from Merkl
    let allCampaigns = await fetchAllRelevantMerklCampaigns();

    let processedCampaignData : IProcessedCampaignData = {};

    let merklRewardAssetAddresses : {[key: number]: string[]} = {};

    // Collect data
    for(let [chainId, chainData] of Object.entries(allCampaigns)) {
      for(let [campaignLongKey, campaignLongKeyData] of Object.entries(chainData)) {
        for(let [campaignId, campaignData] of Object.entries(campaignLongKeyData)) {
          if(CHAIN_ID_TO_CHAIN_NAME[Number(chainId)]) {
            if(!merklRewardAssetAddresses[Number(chainId)]) {
              merklRewardAssetAddresses[Number(chainId)] = [];
            }
            if(merklRewardAssetAddresses[Number(chainId)].indexOf(campaignData.rewardToken) === -1) {
              merklRewardAssetAddresses[Number(chainId)].push(campaignData.rewardToken);
            }
            if(!processedCampaignData[CHAIN_ID_TO_CHAIN_NAME[Number(chainId)]]) {
              processedCampaignData[CHAIN_ID_TO_CHAIN_NAME[Number(chainId)]] = {};
            }
            if(!processedCampaignData[CHAIN_ID_TO_CHAIN_NAME[Number(chainId)]][campaignId]) {
              // Get recipient data
              await sleep(1000);
              let recipientData = await fetchAllMerklCampaignRecipients(chainId, campaignId);
              processedCampaignData[CHAIN_ID_TO_CHAIN_NAME[Number(chainId)]][campaignId] = recipientData;
            }
          }
        }
      }
    }

    // Check that we have an asset record for all relevant assets, else fill blanks
    let unrecognisedAssetAddresses : {[key: number]: string[]} = {};
    for(let [chainId, assetAddresses] of Object.entries(merklRewardAssetAddresses)) {
      for(let assetAddress of assetAddresses) {
        let assetChecksumAddress = utils.getAddress(assetAddress);
        let assetRecord = await AssetRepository.getAssetByAddress(assetChecksumAddress);
        if(!assetRecord) {
          if(!unrecognisedAssetAddresses[Number(chainId)]) {
            unrecognisedAssetAddresses[Number(chainId)] = [];
          }
          unrecognisedAssetAddresses[Number(chainId)].push(assetAddress);
        }
      }
    }

    console.log({unrecognisedAssetAddresses})
    
    try {
      for(let [chainId, assetAddresses] of Object.entries(unrecognisedAssetAddresses)) {
        const chainName = CHAIN_ID_TO_CHAIN_NAME[Number(chainId)];
        if(CHAIN_ID_TO_CHAIN_NAME[Number(chainId)]) {
          const assetContracts = assetAddresses.map(tokenAddress => {
            let contract = new MulticallContract(tokenAddress, ERC20ABI);
            return contract;
          })

          const [...allUnrecognisedAssetDecimals] = await multicallProviderRetryOnFailure(assetContracts.map((contract, index) => contract.decimals()), 'unrecognised asset decimals', chainName);
          const [...allUnrecognisedAssetSymbols] = await multicallProviderRetryOnFailure(assetContracts.map((contract, index) => contract.symbol()), 'unrecognised asset symbols', chainName);
        
          if(
            (allUnrecognisedAssetSymbols.length === allUnrecognisedAssetDecimals.length)
            && (allUnrecognisedAssetSymbols.length === assetAddresses.length)
          ) {
            let index = 0;
            for(let decimals of allUnrecognisedAssetDecimals) {
              let symbol = allUnrecognisedAssetSymbols[index];
              let assetAddress = assetAddresses[index];
              let assetChecksumAddress = utils.getAddress(assetAddress);
              await AssetRepository.create({
                address: assetChecksumAddress,
                symbol,
                decimals,
                network: chainName,
              });
              console.log(`Created asset record for ${assetChecksumAddress} (${symbol}) on ${chainName}`);
              index++;
            }
          }
        }
      }
    } catch(e) {
      console.error("Unable to sync unrecognised assets", e);
    }

    // Store data (we separate collection & storage due to added latency of collection)
    for(let [chainId, chainData] of Object.entries(allCampaigns)) {
      for(let [campaignLongKey, campaignLongKeyData] of Object.entries(chainData)) {
        for(let [campaignId, campaignData] of Object.entries(campaignLongKeyData)) {
          if(CHAIN_ID_TO_CHAIN_NAME[Number(chainId)]) {
            if(processedCampaignData[CHAIN_ID_TO_CHAIN_NAME[Number(chainId)]][campaignId]) {
              // Get recipient data
              let recipientData = processedCampaignData[CHAIN_ID_TO_CHAIN_NAME[Number(chainId)]][campaignId];
              if(recipientData.length > 0) {
                // Clear existing data for campaign since we are doing a full sync operation
                // But still try to be careful not to delete data that has just become unavailable via Merkl's API
                await MerklRewardEntryRepository.query().where({campaign_id: campaignId}).delete();
              }
              for(let rewardEntry of recipientData) {
                await MerklRewardEntryRepository.create({
                  reason: rewardEntry.reason,
                  asset_address: rewardEntry.rewardToken,
                  user_address: rewardEntry.recipient,
                  campaign_tags: campaignData.tags,
                  campaign_id: campaignId,
                  campaign_key_long: campaignLongKey,
                  amount: rewardEntry.amount,
                  network: CHAIN_ID_TO_CHAIN_NAME[Number(chainId)],
                });
              }
            }
          }
        }
      }
    }
    
    console.log(`Periodic merklRewardSync successful, exec time: ${new Date().getTime() - startTime}ms`)

  } catch (e) {
    console.error(`Error encountered in merklRewardSync at ${useTimestampPostgres}, exec time: ${new Date().getTime() - startTime}ms, error: ${e}`)
  }
}