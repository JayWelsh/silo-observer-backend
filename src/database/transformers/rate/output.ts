import BaseTransformer from '../BaseTransformer';

import { IRate } from "../../../interfaces";

class RateTransformer extends BaseTransformer {
  transform(rateEntry: IRate) {
      return {
        id: rateEntry.id,
        rate: rateEntry.rate,
        side: rateEntry.side,
        timestamp: rateEntry.timestamp,
        silo: (rateEntry.silo ? {
          name: rateEntry.silo.name,
          address: rateEntry.silo.address,
          input_token_address: rateEntry.silo.input_token_address
        } : {}),
        asset: (rateEntry.asset ? {
          address: rateEntry.asset.address,
          symbol: rateEntry.asset.symbol,
          decimals: rateEntry.asset.decimals,
        } : {}),
        type: rateEntry.type,
      }
  }
}

export default new RateTransformer();
