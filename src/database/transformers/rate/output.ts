import BaseTransformer from '../BaseTransformer';

import { IRate } from "../../../interfaces";

class RateTransformer extends BaseTransformer {
  transform(rateEntry: IRate) {
    return {
      rate: rateEntry.rate,
      side: rateEntry.side,
      timestamp: rateEntry.timestamp,
      ...(rateEntry.silo && {
        silo: {
          name: rateEntry.silo.name,
          address: rateEntry.silo.address,
          input_token_address: rateEntry.silo.input_token_address
        }
      }),
      ...(rateEntry.asset && {
        asset: {
          address: rateEntry.asset.address,
          symbol: rateEntry.asset.symbol,
          decimals: rateEntry.asset.decimals,
        }
      }),
      ...(!rateEntry.asset && rateEntry.asset_address && {
        asset_address: rateEntry.asset_address,
      }),
      type: rateEntry.type,
    }
  }
}

export default new RateTransformer();
