import { request, gql } from 'graphql-request';
import { raw } from 'objection';
import { utils } from "ethers";
import BigNumber from 'bignumber.js';

BigNumber.config({ EXPONENTIAL_AT: [-1e+9, 1e+9] });

import { subgraphRequestWithRetry } from '../utils';

import {
  IRateEntrySubgraph,
  IToken
} from '../interfaces';

import {
  MAX_MINUTELY_RATE_ENTRIES
} from '../constants'

import {
  SiloRepository,
  AssetRepository,
  RateRepository,
  TvlMinutelyRepository,
  TvlHourlyRepository,
  BorrowedMinutelyRepository,
  BorrowedHourlyRepository,
} from '../database/repositories';

const siloQuery = gql`
  {
    markets {
      id
      totalValueLockedUSD
    	totalBorrowBalanceUSD
      inputToken {
        id
        symbol
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
  }
`;



const periodicSiloDataTracker = async (useTimestampUnix: number, startTime: number) => {
  let useTimestampPostgres = new Date(useTimestampUnix * 1000).toISOString();
  let isHourlyMoment = (useTimestampUnix % 3600) === 0;
  try {

    let result = await subgraphRequestWithRetry(siloQuery);

    let tvlUsdAllSilosBN = new BigNumber(0);
    let borrowedUsdAllSilosBN = new BigNumber(0);

    for(let market of result?.markets) {

      let siloChecksumAddress = utils.getAddress(market.id);
      let inputTokenChecksumAddress = utils.getAddress(market.inputToken.id);
      let inputTokenSymbol = market.inputToken.symbol;

      // --------------------------------------------------

      // TVL HANDLING BELOW
      
      const tvlUsdSiloSpecificBN = new BigNumber(market.totalValueLockedUSD).minus(new BigNumber(market.totalBorrowBalanceUSD));
      const borrowedUsdSiloSpecificBN = new BigNumber(market.totalBorrowBalanceUSD);

      tvlUsdAllSilosBN = tvlUsdAllSilosBN.plus(tvlUsdSiloSpecificBN);
      borrowedUsdAllSilosBN = borrowedUsdAllSilosBN.plus(borrowedUsdSiloSpecificBN);

      await TvlMinutelyRepository.create({
        silo_address: siloChecksumAddress,
        tvl: tvlUsdSiloSpecificBN.toNumber(),
        timestamp: useTimestampPostgres,
      });

      await BorrowedMinutelyRepository.create({
        silo_address: siloChecksumAddress,
        borrowed: borrowedUsdSiloSpecificBN.toNumber(),
        timestamp: useTimestampPostgres,
      });

      if(isHourlyMoment) {
        await TvlHourlyRepository.create({
          silo_address: siloChecksumAddress,
          tvl: tvlUsdSiloSpecificBN.toNumber(),
          timestamp: useTimestampPostgres,
        });
        await BorrowedHourlyRepository.create({
          silo_address: siloChecksumAddress,
          borrowed: borrowedUsdSiloSpecificBN.toNumber(),
          timestamp: useTimestampPostgres,
        });
      }

      // TVL HANDLING ABOVE

      // --------------------------------------------------

      // RATE HANDLING BELOW

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
          });
          console.log(`Created asset record for ${assetChecksumAddress} (${symbol})`);
        }
      }

      // Ensure that silo already exists in DB, else create it.
      let siloRecord = await SiloRepository.getSiloByAddress(siloChecksumAddress);
      if(!siloRecord) {
        // Create record for silo
        await SiloRepository.create({
          name: inputTokenSymbol.toUpperCase(),
          address: siloChecksumAddress,
          input_token_address: inputTokenChecksumAddress,
        });
        console.log(`Created silo record for ${siloChecksumAddress} (${inputTokenSymbol})`);
      }

      // Store rates for each asset
      for (let rateEntry of market.rates) {
        let {
          rate,
          side,
          type,
        } = rateEntry;

        let {
          id,
        } = rateEntry.token;

        let rateAssetChecksumAddress = utils.getAddress(id);

        await RateRepository.create({
          silo_address: siloChecksumAddress,
          asset_address: rateAssetChecksumAddress,
          rate: rate,
          side: side,
          type: type,
          timestamp: useTimestampPostgres
        });
      }

      // RATE HANDLING ABOVE

      // --------------------------------------------------
    }

    // --------------------------------------------------

    // MULTI-MARKET (WHOLE PLATFORM) RECORD HANDLING BELOW

    await TvlMinutelyRepository.create({
      tvl: tvlUsdAllSilosBN.toNumber(),
      timestamp: useTimestampPostgres,
      meta: 'all',
    });

    await BorrowedMinutelyRepository.create({
      borrowed: borrowedUsdAllSilosBN.toNumber(),
      timestamp: useTimestampPostgres,
      meta: 'all',
    });

    if(isHourlyMoment) {
      await TvlHourlyRepository.create({
        tvl: tvlUsdAllSilosBN.toNumber(),
        timestamp: useTimestampPostgres,
        meta: 'all',
      });
      await BorrowedHourlyRepository.create({
        borrowed: borrowedUsdAllSilosBN.toNumber(),
        timestamp: useTimestampPostgres,
        meta: 'all',
      });
    }

    // MULTI-MARKET (WHOLE PLATFORM) RECORD HANDLING ABOVE
    
    // --------------------------------------------------

    // RECORD EXPIRY HANDLING BELOW

    // remove any minutely records older than 1441 minutes in one query
    let deletedExpiredRecordCount = await RateRepository.query().delete().where(raw(`timestamp < now() - interval '${MAX_MINUTELY_RATE_ENTRIES} minutes'`));

    // RECORD EXPIRY HANDLING ABOVE

    // --------------------------------------------------

    console.log(`Successfully stored latest rates & tvls for silos (${useTimestampPostgres}),${deletedExpiredRecordCount > 0 ? ` Deleted ${deletedExpiredRecordCount} expired rate records,` : ''} execution time: ${new Date().getTime() - startTime}ms`);
  } catch (error) {
    console.error(`Unable to store latest rates for silos (${useTimestampPostgres})`, error);
  }
}

export {
  periodicSiloDataTracker
}