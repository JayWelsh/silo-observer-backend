import BaseTransformer from '../BaseTransformer';

import { ISiloUserEvent } from "../../../interfaces";

class SiloUserEventTransformer extends BaseTransformer {
  transform(event: ISiloUserEvent) {
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
      ...(event.block_metadata && {
        block_hash: event.block_metadata.block_hash,
        block_timestamp: event.block_metadata.block_timestamp,
        block_timestamp_unix: event.block_metadata.block_timestamp_unix,
        network: event.block_metadata.network,
        block_day_timestamp: event.block_metadata.block_day_timestamp,
      })
    }
  }
}

export default new SiloUserEventTransformer();
