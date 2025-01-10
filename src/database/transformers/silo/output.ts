import BaseTransformer from '../BaseTransformer';

import RateOutputTransformer from "../rate/output";

import { ISilo } from "../../../interfaces";

class SiloOutputTransformer extends BaseTransformer {
  transform(siloEntry: ISilo) {
    if(siloEntry) {
      return {
        name: siloEntry.name,
        address: siloEntry.address,
        network: siloEntry.network,
        deployment_id: siloEntry.deployment_id,
        input_token_address: siloEntry.input_token_address,
        tvl: siloEntry.tvl,
        borrowed: siloEntry.borrowed,
        latest_rates: siloEntry.latest_rates?.map(entry => RateOutputTransformer.transform(entry)),
        protocol_version: siloEntry.protocol_version,
        ...(siloEntry.silo_config_v2 && {silo_config_v2: siloEntry.silo_config_v2}),
      }
    }
  }
}

export default new SiloOutputTransformer();
