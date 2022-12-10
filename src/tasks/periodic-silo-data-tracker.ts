import { request, gql } from 'graphql-request';
import { raw } from 'objection';

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
} from '../database/repositories';

const siloQuery = gql`
  {
    markets {
      id
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
  try {
    let result = await subgraphRequestWithRetry(siloQuery);
    for(let market of result?.markets) {

      let siloAddress = market.id;
      let inputTokenAddress = market.inputToken.id;
      let inputTokenSymbol = market.inputToken.symbol;

      // Load relevant assets to this silo into memory
      let siloAssets = market.rates.reduce((acc: IToken[], rateEntry: IRateEntrySubgraph) => {
        let {
          id,
          symbol,
          decimals
        } = rateEntry.token
        if(!acc.find((item: IToken) => item.address === id)) {
          acc.push({
            address: id,
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

        let assetRecord = await AssetRepository.getAssetByAddress(address);
        if(!assetRecord) {
          await AssetRepository.create({
            address,
            symbol,
            decimals,
          });
          console.log(`Created asset record for ${address} (${symbol})`);
        }
      }

      // Ensure that silo already exists in DB, else create it.
      let siloRecord = await SiloRepository.getSiloByAddress(siloAddress);
      if(!siloRecord) {
        // Create record for silo
        await SiloRepository.create({
          name: inputTokenSymbol.toUpperCase(),
          address: siloAddress,
          input_token_address: inputTokenAddress,
        });
        console.log(`Created silo record for ${siloAddress} (${inputTokenSymbol})`);
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

        // Get current count of minutely rate records for this `silo` `asset` on this `side`, store a maximum of 1440 (24 hours of minutely data)
        
        // Leading to poor performance, disabling for now and enabling a one-query delete at the end of this process to see how performance is impacted

        // let currentRateCount = await RateRepository.getRateRecordCountByAssetOnSideInSilo(id, side, siloAddress);

        // if(currentRateCount >= MAX_MINUTELY_RATE_ENTRIES) {
        //   // get record to delete
        //   let oldestRecord = await RateRepository.getOldestRateByAssetOnSideInSilo(id, side, siloAddress);
        //   if(oldestRecord?.id) {
        //     // delete oldest record to keep minutely entries at MAX_MINUTELY_RATE_ENTRIES (1440, 24 hour resolution of minutely data)
        //     await RateRepository.delete(oldestRecord.id);
        //   } else {
        //     console.error(`Can't find oldest record`, oldestRecord, {id, side, siloAddress});
        //   }
        // }

        await RateRepository.create({
          silo_address: siloAddress,
          asset_address: id,
          rate: rate,
          side: side,
          type: type,
          timestamp: useTimestampPostgres
        });
      }
    }
    
    // remove any records older than 1441 minutes in one query
    let deletedExpiredRecordCount = await RateRepository.query().delete().where(raw("timestamp < now() - interval '1441 minutes'"));

    console.log(`Successfully stored latest rates for silos (${useTimestampPostgres}),${deletedExpiredRecordCount > 0 ? ` Deleted ${deletedExpiredRecordCount} expired records,` : ''} execution time: ${new Date().getTime() - startTime}ms`);
  } catch (error) {
    console.error(`Unable to store latest rates for silos (${useTimestampPostgres})`, error);
  }
}

export {
  periodicSiloDataTracker
}