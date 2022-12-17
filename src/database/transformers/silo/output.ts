import BaseTransformer from '../BaseTransformer';

import RateOutputTransformer from "../rate/output";

import { ISilo } from "../../../interfaces";

class SiloOutputTransformer extends BaseTransformer {
  transform(siloEntry: ISilo) {
    return {
      name: siloEntry.name,
      address: siloEntry.address,
      input_token_address: siloEntry.input_token_address,
      tvl: siloEntry.tvl,
      borrowed: siloEntry.borrowed,
      latest_rates: siloEntry.latest_rates?.map(entry => RateOutputTransformer.transform(entry)),
    }
  }
}

export default new SiloOutputTransformer();
