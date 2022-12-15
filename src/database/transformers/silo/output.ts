import BaseTransformer from '../BaseTransformer';

import { ISilo } from "../../../interfaces";

class SiloOutputTransformer extends BaseTransformer {
  transform(siloEntry: ISilo) {
    return {
      name: siloEntry.name,
      address: siloEntry.address,
      input_token_address: siloEntry.input_token_address,
    }
  }
}

export default new SiloOutputTransformer();
