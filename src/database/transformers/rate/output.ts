import BaseTransformer from '../BaseTransformer';

import { IRate } from "../../../interfaces";

class RateTransformer extends BaseTransformer {
  transform(rateEntry: IRate) {
      return {
        rate: rateEntry.rate,
        timestamp: rateEntry.timestamp,
        silo_address: rateEntry.silo_address,
        asset_address: rateEntry.asset_address,
        type: rateEntry.type,
      }
  }
}

export default new RateTransformer();
