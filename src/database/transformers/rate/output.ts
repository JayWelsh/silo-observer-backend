import BaseTransformer from '../BaseTransformer';

import { IRate } from "../../../interfaces";

class RateTransformer extends BaseTransformer {
  transform(rateEntry: IRate) {
      return {
        id: rateEntry.id,
        rate: rateEntry.rate,
        side: rateEntry.side,
        timestamp: rateEntry.timestamp,
        silo_address: rateEntry.silo_address,
        asset_address: rateEntry.asset_address,
        type: rateEntry.type,
      }
  }
}

export default new RateTransformer();
