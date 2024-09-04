import { gql } from 'graphql-request';
import axios from 'axios';
import { raw } from 'objection';
import { utils } from "ethers";
import BigNumber from 'bignumber.js';

import {
  sleep,
} from '../utils';

BigNumber.config({ EXPONENTIAL_AT: [-1e+9, 1e+9] });

import { 
  subgraphRequestWithRetry,
  getCoingeckoOverrides,
} from '../utils';

import {
  IRateEntrySubgraph,
  IToken,
  ISilo,
} from '../interfaces';

import {
  getLatestBlockNumber,
} from '../web3/jobs';

import {
  MAX_MINUTELY_RATE_ENTRIES,
  MAX_MINUTELY_TVL_AND_BORROWED_ENTRIES,
  NETWORK_ID_TO_COINGECKO_ID,
  NETWORKS,
  DEPLOYMENT_CONFIGS,
  NETWORK_TO_SUBGRAPH,
  SILO_BLACKLIST,
  COINGECKO_API_KEY,
} from '../constants'

import {
  SiloRepository,
  AssetRepository,
  RateLatestRepository,
  RateRepository,
  RateHourlyRepository,
  TvlMinutelyRepository,
  TvlHourlyRepository,
  TvlLatestRepository,
  BorrowedMinutelyRepository,
  BorrowedHourlyRepository,
  BorrowedLatestRepository,
} from '../database/repositories';

import {
  getAllSiloAssetBalances,
  getAllSiloAssetRates,
} from '../web3/jobs';
import e from 'express';

const siloQuery =  `{
  silos {
    id
    totalValueLockedUSD
    totalBorrowBalanceUSD
    baseAsset {
      id
      symbol
      lastPriceUSD
    }
    bridgeAsset {
      id
      lastPriceUSD
    }
    rates {
      rate
      side
      type
      token {
        id
        symbol
        decimals
      }
    }
  }
  _meta {
    block {
      hash
      timestamp
    }
  }
}`;

const siloQueryTempArbitrumForceHeadIndexers = (latestBlockNumber: number | string) => `{
  silos(block: {number_gte: ${latestBlockNumber}}) {
    id
    totalValueLockedUSD
    totalBorrowBalanceUSD
    baseAsset {
      id
      symbol
      lastPriceUSD
    }
    bridgeAsset {
      id
      lastPriceUSD
    }
    rates {
      rate
      side
      type
      token {
        id
        symbol
        decimals
      }
    }
  }
  _meta {
    block {
      hash
      timestamp
    }
  }
}`;

let enableRateSync = true;
let enableTvlSync = true;
let enableBorrowedSync = true;

interface ITokenAddressToLastPrice {
  [key: string]: string
}

interface ICoingeckoAssetPriceEntryResponse {
  [key: string]: ICoingeckoAssetPriceEntry
}

interface ICoingeckoAssetPriceEntry {
  usd: number 
}

let coingeckoRetryMax = 10;

let unrecognisedTokens : any[] = [];

// TODO move to dedicated file to share with other files which might use it in the future
const fetchCoingeckoPrices = async (assetAddressesQueryString : string, network: string, retryCount = 0) => {

  let {
    assetAddressesQueryString: assetAddressesQueryStringWithOverrides,
    proxyToOrigin: coingeckoOverridesProxyToOrigin
  } = getCoingeckoOverrides(assetAddressesQueryString, network);

  let results : ICoingeckoAssetPriceEntry[] = await axios.get(
    `https://pro-api.coingecko.com/api/v3/simple/token_price/${NETWORK_ID_TO_COINGECKO_ID[network]}?contract_addresses=${assetAddressesQueryStringWithOverrides}&vs_currencies=USD&x_cg_pro_api_key=${COINGECKO_API_KEY}`,
    {
      headers: { "Accept-Encoding": "gzip,deflate,compress" }
    }
  )
  .then(function (response) {
    // handle success
    if(response?.data) {
      for (const [proxyAddress, originAddress] of Object.entries(coingeckoOverridesProxyToOrigin)) {
        if (proxyAddress && originAddress && response?.data[proxyAddress.toLowerCase()]) {
          response.data[originAddress.toLowerCase()] = response?.data[proxyAddress.toLowerCase()];
        }
      }
    }
    return response?.data ? response?.data : {};
  })
  .catch(async (e) => {
    retryCount++;
    if(retryCount < coingeckoRetryMax) {
      console.error(`error fetching coingecko prices at ${Math.floor(new Date().getTime() / 1000)}, retry #${retryCount}...`, e?.response?.data?.error === "coin not found" ? "" : e);
      if(e?.response?.data?.error === "coin not found") {
        unrecognisedTokens.push(assetAddressesQueryStringWithOverrides);
        console.log(`skipping retries since coin is not found on ${assetAddressesQueryStringWithOverrides}`);
        return {};
      }
      await sleep(5000);
      return await fetchCoingeckoPrices(assetAddressesQueryStringWithOverrides, network, retryCount);
    } else {
      console.error(`retries failed, error fetching coingecko prices at ${Math.floor(new Date().getTime() / 1000)}`, e);
    }
    return {};
  })
  let assetAddressToCoingeckoUsdPrice : ITokenAddressToLastPrice = {}
  let iterable = Object.entries(results);
  if(iterable.length > 0) {
    for(let assetAddressToPrice of iterable) {
      let checksumAssetAddress = utils.getAddress(assetAddressToPrice[0]);
      if(assetAddressToPrice[1].usd) {
        assetAddressToCoingeckoUsdPrice[checksumAssetAddress] = new BigNumber(assetAddressToPrice[1].usd).toString();
      } else {
        assetAddressToCoingeckoUsdPrice[checksumAssetAddress] = new BigNumber(0).toString();
      }
    }
  }
  console.log({unrecognisedTokens})
  return assetAddressToCoingeckoUsdPrice;
}

const periodicSiloDataTracker = async (useTimestampUnix: number, startTime: number) => {

  let useTimestampPostgres = new Date(useTimestampUnix * 1000).toISOString();
  let isHourlyMoment = (useTimestampUnix % 3600) === 0;

  for(let deploymentConfig of DEPLOYMENT_CONFIGS) {

    try {

      let {
        success,
        siloAssetBalances,
        siloAddresses,
        allSiloAssetsWithState,
        assetAddresses,
      } = await getAllSiloAssetBalances(deploymentConfig);

      if(success) {

        let siloAssetRates = await getAllSiloAssetRates(siloAddresses, allSiloAssetsWithState, deploymentConfig);

        let coingeckoAddressesQuery = assetAddresses.join(',');

        let tokenAddressToCoingeckoPrice = await fetchCoingeckoPrices(coingeckoAddressesQuery, deploymentConfig.network);

        let latestBlockNumber = await getLatestBlockNumber(deploymentConfig.network);

        // use these to make use of the special logic for querying Arbitrum subgraph
        let initialQuery = deploymentConfig.network === 'arbitrum' ? siloQueryTempArbitrumForceHeadIndexers(latestBlockNumber - 1000) : siloQuery;
        let backupQuery = deploymentConfig.network === 'arbitrum' ? (overrideBlock: string) => siloQueryTempArbitrumForceHeadIndexers(`${overrideBlock}`) : (overrideBlock: string) => siloQuery;

        // use these to avoid the special logic for querying querying Arbitrum subgraph
        // let initialQuery = siloQuery;
        // let backupQuery = (overrideBlock: string) => siloQuery;

        let resultRaw = await subgraphRequestWithRetry(initialQuery, backupQuery, deploymentConfig.subgraphEndpoint, deploymentConfig.subgraphEndpointFallback);

        let result = resultRaw.data;

        let tvlUsdAllSilosBN = new BigNumber(0);
        let borrowedUsdAllSilosBN = new BigNumber(0);
        let tvlUsdSiloAddressToAssetAddressBN : {[key: string]: {[key: string]: BigNumber}} = {};
        let hasCountedSiloTVL : {[key: string]: boolean} = {};

        let tokenAddressToLastPrice = result?.silos.reduce((acc: ITokenAddressToLastPrice, silo: ISilo) => {
          let inputTokenChecksumAddress = utils.getAddress(silo.baseAsset.id);
          let inputTokenLastPrice = silo.baseAsset.lastPriceUSD;
          if(!acc[inputTokenChecksumAddress] && inputTokenLastPrice) {
            acc[inputTokenChecksumAddress] = inputTokenLastPrice;
          }
          for(let bridgeAsset of silo.bridgeAsset) {
            let bridgeAssetAddress = utils.getAddress(bridgeAsset.id);
            let bridgeAssetLastPrice = bridgeAsset.lastPriceUSD;
            if(!acc[bridgeAssetAddress] && bridgeAssetLastPrice) {
              acc[bridgeAssetAddress] = bridgeAssetLastPrice;
            }
          }
          return acc;
        }, {});

        let nonBlacklistedMarkets = result?.silos.filter((market: any) => SILO_BLACKLIST.indexOf(utils.getAddress(market.id.split("-")[0])) === -1);

        for(let market of nonBlacklistedMarkets) {

          let siloChecksumAddress = utils.getAddress(market.id.split("-")[0]);
          let inputTokenChecksumAddress = utils.getAddress(market.baseAsset.id);
          let inputTokenSymbol = market.baseAsset.symbol;

          // --------------------------------------------------

          // PATCH MISSING SILOS / ASSETS BELOW

          // Load relevant assets to this silo into memory
          let siloAssets = market.rates.reduce((acc: IToken[], rateEntry: IRateEntrySubgraph) => {
            let {
              id,
              symbol,
              decimals
            } = rateEntry.token
            if(!acc.find((item: IToken) => item.address === id)) {
              acc.push({
                address: utils.getAddress(id),
                symbol,
                decimals
              })
            }
            return acc;
          }, [] as IToken[]);

          // Ensure that relevant assets already exist, else create them
          for(let siloAsset of siloAssets) {
            let {
              address,
              symbol,
              decimals
            } = siloAsset;

            let assetChecksumAddress = utils.getAddress(address);
            let assetRecord = await AssetRepository.getAssetByAddress(assetChecksumAddress);
            if(!assetRecord) {
              await AssetRepository.create({
                address: assetChecksumAddress,
                symbol,
                decimals,
                network: deploymentConfig.network,
              });
              console.log(`Created asset record for ${assetChecksumAddress} (${symbol})`);
            }
          }

          // Ensure that silo already exists in DB, else create it.
          let siloRecord = await SiloRepository.getSiloByAddress(siloChecksumAddress, deploymentConfig.id);
          if(!siloRecord) {
            // Create record for silo
            await SiloRepository.create({
              name: inputTokenSymbol,
              address: siloChecksumAddress,
              input_token_address: inputTokenChecksumAddress,
              network: deploymentConfig.network,
              deployment_id: deploymentConfig.id,
            });
            console.log(`Created silo record for ${siloChecksumAddress} (${inputTokenSymbol})`);
          }

          // PATCH MISSING SILOS / ASSETS ABOVE

          // --------------------------------------------------

          // TVL HANDLING BELOW
          
          // Method 1
          // const tvlUsdSiloSpecificBN = new BigNumber(market.totalValueLockedUSD).minus(new BigNumber(market.totalBorrowBalanceUSD));
          // const borrowedUsdSiloSpecificBN = new BigNumber(market.totalBorrowBalanceUSD);

          // Method 2 (using info directly from chain for TVL to reduce reliance on off-chain data)
          let tvlUsdSiloSpecificBN = new BigNumber(0);
          if(siloAssetBalances[siloChecksumAddress]) {
            tvlUsdSiloSpecificBN = Object.entries(siloAssetBalances[siloChecksumAddress]).reduce((acc, entry) => {
              let tokenChecksumAddress = entry[1].tokenAddress;
              let subgraphTokenPrice = new BigNumber(tokenAddressToLastPrice[tokenChecksumAddress]);
              let coingeckoPrice = new BigNumber(tokenAddressToCoingeckoPrice[tokenChecksumAddress]);
              let usePrice = coingeckoPrice.toNumber() > 0 ? coingeckoPrice : subgraphTokenPrice;
              let tokenBalance = new BigNumber(entry[1].balance);
              if(usePrice.isGreaterThan(0) && tokenBalance.isGreaterThan(0)) {
                let usdValueOfAsset = tokenBalance.multipliedBy(usePrice);
                if(tvlUsdSiloAddressToAssetAddressBN[siloChecksumAddress]) {
                  if(tvlUsdSiloAddressToAssetAddressBN[siloChecksumAddress][tokenChecksumAddress]) {
                    tvlUsdSiloAddressToAssetAddressBN[siloChecksumAddress][tokenChecksumAddress] = tvlUsdSiloAddressToAssetAddressBN[siloChecksumAddress][tokenChecksumAddress].plus(usdValueOfAsset);
                  } else {
                    tvlUsdSiloAddressToAssetAddressBN[siloChecksumAddress][tokenChecksumAddress] = new BigNumber(usdValueOfAsset);
                  }
                } else {
                  tvlUsdSiloAddressToAssetAddressBN[siloChecksumAddress] = {};
                  tvlUsdSiloAddressToAssetAddressBN[siloChecksumAddress][tokenChecksumAddress] = new BigNumber(usdValueOfAsset);
                }
                acc = acc.plus(usdValueOfAsset);
              }
              return acc;
            }, new BigNumber(0));
          } else {
            console.log({"could not process asset balances for": siloChecksumAddress});
          }
          const borrowedUsdSiloSpecificBN = new BigNumber(market.totalBorrowBalanceUSD);

          if(!hasCountedSiloTVL?.[siloChecksumAddress]) {
            tvlUsdAllSilosBN = tvlUsdAllSilosBN.plus(tvlUsdSiloSpecificBN);
            hasCountedSiloTVL[siloChecksumAddress] = true;
          }
          borrowedUsdAllSilosBN = borrowedUsdAllSilosBN.plus(borrowedUsdSiloSpecificBN);

          if (enableTvlSync) {
            await TvlMinutelyRepository.create({
              silo_address: siloChecksumAddress,
              tvl: tvlUsdSiloSpecificBN.toNumber(),
              timestamp: useTimestampPostgres,
              network: deploymentConfig.network,
              deployment_id: deploymentConfig.id,
            });
            await SiloRepository.query().update({
              tvl: tvlUsdSiloSpecificBN.toNumber(),
            }).where("address", siloChecksumAddress);
          }

          if(enableBorrowedSync) {
            await BorrowedMinutelyRepository.create({
              silo_address: siloChecksumAddress,
              borrowed: borrowedUsdSiloSpecificBN.toNumber(),
              timestamp: useTimestampPostgres,
              network: deploymentConfig.network,
              deployment_id: deploymentConfig.id,
            });
            await SiloRepository.query().update({
              borrowed: borrowedUsdSiloSpecificBN.toNumber(),
            }).where("address", siloChecksumAddress);
          }

          if(isHourlyMoment) {
            if (enableTvlSync) {
              await TvlHourlyRepository.create({
                silo_address: siloChecksumAddress,
                tvl: tvlUsdSiloSpecificBN.toNumber(),
                timestamp: useTimestampPostgres,
                network: deploymentConfig.network,
                deployment_id: deploymentConfig.id,
              });
            }
            if(enableBorrowedSync) {
              await BorrowedHourlyRepository.create({
                silo_address: siloChecksumAddress,
                borrowed: borrowedUsdSiloSpecificBN.toNumber(),
                timestamp: useTimestampPostgres,
                network: deploymentConfig.network,
                deployment_id: deploymentConfig.id,
              });
            }
          }

          // TVL HANDLING ABOVE

          // --------------------------------------------------

          // RATE HANDLING BELOW

          // Store rates for each asset
          if(siloAssetRates[siloChecksumAddress]) {
            for (let rateEntry of siloAssetRates[siloChecksumAddress]) {
              let {
                tokenAddress,
                rate,
                side,
              } = rateEntry;

              let rateToNumericPrecision = new BigNumber(rate).precision(16).toString();

              let rateAssetChecksumAddress = utils.getAddress(tokenAddress);

              let assetRecord = await AssetRepository.getAssetByAddress(rateAssetChecksumAddress);

              // All rates show as variable on subgraph at the moment
              // TODO: Figure out actual rate types via chain query
              let type = "VARIABLE";

              if(enableRateSync && assetRecord) {

                let latestRecord = await RateLatestRepository.getLatestRateByAssetOnSideInSilo(rateAssetChecksumAddress, side, siloChecksumAddress, deploymentConfig.id);
                if(latestRecord) {
                  // update latest record
                  await RateLatestRepository.update({
                    rate: rateToNumericPrecision,
                    timestamp: useTimestampPostgres,
                  }, latestRecord.id);
                } else {
                  // create latest record
                  await RateLatestRepository.create({
                    silo_address: siloChecksumAddress,
                    asset_address: rateAssetChecksumAddress,
                    rate: rateToNumericPrecision,
                    side: side,
                    type: type,
                    timestamp: useTimestampPostgres,
                    network: deploymentConfig.network,
                    deployment_id: deploymentConfig.id,
                  });
                }

                await RateRepository.create({
                  silo_address: siloChecksumAddress,
                  asset_address: rateAssetChecksumAddress,
                  rate: rateToNumericPrecision,
                  side: side,
                  type: type,
                  timestamp: useTimestampPostgres,
                  network: deploymentConfig.network,
                  deployment_id: deploymentConfig.id,
                });

                if(isHourlyMoment) {
                  await RateHourlyRepository.create({
                    silo_address: siloChecksumAddress,
                    asset_address: rateAssetChecksumAddress,
                    rate: rateToNumericPrecision,
                    side: side,
                    type: type,
                    timestamp: useTimestampPostgres,
                    network: deploymentConfig.network,
                    deployment_id: deploymentConfig.id,
                  });
                }

              }

            }

          } else {
            console.log({'could not process rates for': siloChecksumAddress})
          }

          // RATE HANDLING ABOVE

          // --------------------------------------------------
        }

        // --------------------------------------------------

        // MULTI-MARKET (WHOLE PLATFORM) RECORD HANDLING BELOW

        if (enableTvlSync) {

          await TvlMinutelyRepository.create({
            tvl: tvlUsdAllSilosBN.toNumber(),
            timestamp: useTimestampPostgres,
            meta: 'all',
            network: deploymentConfig.network,
            deployment_id: deploymentConfig.id,
          });

          let latestRecord = await TvlLatestRepository.getLatestResultByNetworkAndMetaAndDeploymentID(deploymentConfig.network, "all", deploymentConfig.id);
          if(latestRecord) {
            // update latest record
            await TvlLatestRepository.update({
              tvl: tvlUsdAllSilosBN.toNumber(),
              timestamp: useTimestampPostgres,
            }, latestRecord.id);
          } else {
            // create latest record
            await TvlLatestRepository.create({
              tvl: tvlUsdAllSilosBN.toNumber(),
              timestamp: useTimestampPostgres,
              meta: 'all',
              network: deploymentConfig.network,
              deployment_id: deploymentConfig.id,
            });
          }

          for(let [siloAddress, entry] of Object.entries(tvlUsdSiloAddressToAssetAddressBN)) {
            for(let [assetAddress, tvlValue] of Object.entries(entry)) {
              let latestSiloToAssetRecord = await TvlLatestRepository.getLatestResultByNetworkAndSiloAddressAndAssetAddressAndDeploymentID(deploymentConfig.network, siloAddress, assetAddress, deploymentConfig.id);
              if(latestSiloToAssetRecord) {
                // update latest record
                await TvlLatestRepository.update({
                  tvl: tvlValue.toNumber(),
                  timestamp: useTimestampPostgres,
                }, latestSiloToAssetRecord.id);
              } else {
                // create latest record
                await TvlLatestRepository.create({
                  tvl: tvlValue.toNumber(),
                  timestamp: useTimestampPostgres,
                  silo_address: siloAddress,
                  asset_address: assetAddress,
                  meta: 'individual',
                  network: deploymentConfig.network,
                  deployment_id: deploymentConfig.id,
                });
              }
            }
          }
        }

        if(enableBorrowedSync) {

          await BorrowedMinutelyRepository.create({
            borrowed: borrowedUsdAllSilosBN.toNumber(),
            timestamp: useTimestampPostgres,
            meta: 'all',
            network: deploymentConfig.network,
            deployment_id: deploymentConfig.id,
          });

          let latestRecord = await BorrowedLatestRepository.getLatestResultByNetworkAndMetaAndDeploymentID(deploymentConfig.network, "all", deploymentConfig.id);
          if(latestRecord) {
            // update latest record
            await BorrowedLatestRepository.update({
              borrowed: borrowedUsdAllSilosBN.toNumber(),
              timestamp: useTimestampPostgres,
            }, latestRecord.id);
          } else {
            // create latest record
            await BorrowedLatestRepository.create({
              borrowed: borrowedUsdAllSilosBN.toNumber(),
              timestamp: useTimestampPostgres,
              meta: 'all',
              network: deploymentConfig.network,
              deployment_id: deploymentConfig.id,
            });
          }

        }

        if(isHourlyMoment) {
          if (enableTvlSync) {
            await TvlHourlyRepository.create({
              tvl: tvlUsdAllSilosBN.toNumber(),
              timestamp: useTimestampPostgres,
              meta: 'all',
              network: deploymentConfig.network,
              deployment_id: deploymentConfig.id,
            });
          }
          if(enableBorrowedSync) {
            await BorrowedHourlyRepository.create({
              borrowed: borrowedUsdAllSilosBN.toNumber(),
              timestamp: useTimestampPostgres,
              meta: 'all',
              network: deploymentConfig.network,
              deployment_id: deploymentConfig.id,
            });
          }
        }

        // MULTI-MARKET (WHOLE PLATFORM) RECORD HANDLING ABOVE
        
        // --------------------------------------------------

        // RECORD EXPIRY HANDLING BELOW

        // remove any minutely records older than 1441 minutes in one query
        let deletedExpiredRateRecordCount = 0;
        if(enableRateSync) {
          deletedExpiredRateRecordCount = await RateRepository.query().delete().where(raw(`timestamp < now() - interval '${MAX_MINUTELY_RATE_ENTRIES} minutes'`));
        }

        let deletedExpiredTVLMinutelyRecordCount = 0;
        if(enableTvlSync) {
          deletedExpiredTVLMinutelyRecordCount = await TvlMinutelyRepository.query().delete().where(raw(`timestamp < now() - interval '${MAX_MINUTELY_TVL_AND_BORROWED_ENTRIES} minutes'`));
        }

        let deletedExpiredBorrowedMinutelyRecordCount = 0;
        if(enableBorrowedSync) {
          deletedExpiredBorrowedMinutelyRecordCount = await BorrowedMinutelyRepository.query().delete().where(raw(`timestamp < now() - interval '${MAX_MINUTELY_TVL_AND_BORROWED_ENTRIES} minutes'`));
        }

        // RECORD EXPIRY HANDLING ABOVE

        // --------------------------------------------------

        console.log(`Sync success (${deploymentConfig.network} - ${deploymentConfig.id}) (${useTimestampPostgres}),${deletedExpiredRateRecordCount > 0 ? ` Deleted ${deletedExpiredRateRecordCount} expired rate records,` : ''} ${deletedExpiredTVLMinutelyRecordCount > 0 ? ` Deleted ${deletedExpiredTVLMinutelyRecordCount} expired TVL minutely records,` : ''} ${deletedExpiredBorrowedMinutelyRecordCount > 0 ? ` Deleted ${deletedExpiredBorrowedMinutelyRecordCount} expired Borrowed minutely records,` : ''} enableRateSync: ${enableRateSync}, enableTvlSync: ${enableTvlSync}, enableBorrowedSync: ${enableBorrowedSync}, exec time: ${new Date().getTime() - startTime}ms`);
    
      }else{
        throw new Error(`getAllSiloAssetBalances unsuccessful`)
      }
    } catch (error) {
      console.error(`Unable to store latest rates for silos (${deploymentConfig.network} - ${deploymentConfig.id}) (${useTimestampPostgres})`, error);
    }

  }
}

export {
  periodicSiloDataTracker
}