import BaseTransformer from '../BaseTransformer';

import { ISiloUserEventMaterializedView } from "../../../interfaces";

class SiloUserEventMaterializedViewTransformer extends BaseTransformer {
  transform(event: ISiloUserEventMaterializedView) {
    return {
      event_name: event.event_name,
      user_address: event.user_address,
      amount: event.amount,
      tx_hash: event.tx_hash,
      block_number: event.block_number,
      usd_value_at_event_time: event.usd_value_at_event_time,
      deployment_id: event.deployment_id,
      ...(event.receiver_address && {
        receiver_address: event.receiver_address,
      }),
      ...(event.gas_used && {
        gas_used: event.gas_used,
      }),
      ...(event.effective_gas_price && {
        effective_gas_price: event.effective_gas_price,
      }),
      ...(event.event_fingerprint && {
        event_fingerprint: event.event_fingerprint,
      }),
      ...(event.silo && {
        silo: {
          name: event.silo.name,
          address: event.silo.address,
          input_token_address: event.silo.input_token_address
        }
      }),
      ...(event.asset && {
        asset: {
          address: event.asset.address,
          symbol: event.asset.symbol,
          decimals: event.asset.decimals,
        }
      }),
      ...(!event.asset && event.asset_address && {
        asset_address: event.asset_address,
      }),
      block_hash: event?.block_hash,
      block_timestamp: event?.block_timestamp,
      block_timestamp_unix: event?.block_timestamp_unix,
      network: event?.network,
      block_day_timestamp: event?.block_day_timestamp,
    }
  }
}

export default new SiloUserEventMaterializedViewTransformer();
