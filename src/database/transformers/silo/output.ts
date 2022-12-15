import BaseTransformer from '../BaseTransformer';

import { ISilo } from "../../../interfaces";

class SiloOutputTransformer extends BaseTransformer {
  transform(siloEntry: ISilo) {
    return {
      name: siloEntry.name,
      address: siloEntry.address,
      input_token_address: siloEntry.input_token_address,
      tvl: siloEntry.tvl,
      borrowed: siloEntry.borrowed,
    }
  }
}

export default new SiloOutputTransformer();
