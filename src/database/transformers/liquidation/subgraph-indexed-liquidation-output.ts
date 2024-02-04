import BaseTransformer from '../BaseTransformer';

import { ISubgraphLiquidationRecord } from "../../../interfaces";

class SubgraphLiquidationRecordTransformer extends BaseTransformer {
  transform(subgraphRecord: ISubgraphLiquidationRecord) {
    return {
      user_address: subgraphRecord.liquidator,
      amount: subgraphRecord.amount,
      amount_usd: subgraphRecord.amount_usd,
      profit_usd: subgraphRecord.profit_usd,
      tx_hash: subgraphRecord.tx_hash,
      block_number: subgraphRecord.block_number,
      deployment_id: subgraphRecord.deployment_id,
      timestamp_unix: subgraphRecord.timestamp_unix,
      liquidator_address: subgraphRecord.liquidator,
      liquidatee_address: subgraphRecord.liquidatee,
      ...(subgraphRecord.record_fingerprint && {
        record_fingerprint: subgraphRecord.record_fingerprint,
      }),
      ...(subgraphRecord.silo && {
        silo: {
          name: subgraphRecord.silo.name,
          address: subgraphRecord.silo.address,
          input_token_address: subgraphRecord.silo.input_token_address
        }
      }),
      ...(subgraphRecord.asset && {
        asset: {
          address: subgraphRecord.asset.address,
          symbol: subgraphRecord.asset.symbol,
          decimals: subgraphRecord.asset.decimals,
        }
      }),
      ...(!subgraphRecord.asset && subgraphRecord.asset_address && {
        asset_address: subgraphRecord.asset_address,
      }),
      ...(subgraphRecord.block_metadata && {
        block_hash: subgraphRecord.block_metadata.block_hash,
        block_timestamp: subgraphRecord.block_metadata.block_timestamp,
        block_timestamp_unix: subgraphRecord.block_metadata.block_timestamp_unix,
        network: subgraphRecord.block_metadata.network,
        block_day_timestamp: subgraphRecord.block_metadata.block_day_timestamp,
      })
    }
  }
}

export default new SubgraphLiquidationRecordTransformer();
