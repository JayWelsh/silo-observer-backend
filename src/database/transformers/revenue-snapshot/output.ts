import BaseTransformer from '../BaseTransformer';

import { IRevenueSnapshot } from "../../../interfaces";

class RevenueSnapshotTransformer extends BaseTransformer {
  transform(snapshotEntry: IRevenueSnapshot) {
    return {
      amount_pending: snapshotEntry.amount_pending,
      amount_pending_usd: snapshotEntry.amount_pending_usd,
      amount_harvested: snapshotEntry.amount_harvested,
      amount_harvested_usd: snapshotEntry.amount_harvested_usd,
      asset_price_at_sync_time: snapshotEntry.asset_price_at_sync_time,
      timestamp: snapshotEntry.timestamp,
      network: snapshotEntry.network,
      deployment_id: snapshotEntry.deployment_id,
      ...(snapshotEntry.silo && {
        silo: {
          name: snapshotEntry.silo.name,
          address: snapshotEntry.silo.address,
          input_token_address: snapshotEntry.silo.input_token_address
        }
      }),
      ...(snapshotEntry.asset && {
        asset: {
          address: snapshotEntry.asset.address,
          symbol: snapshotEntry.asset.symbol,
          decimals: snapshotEntry.asset.decimals,
        }
      }),
      ...(!snapshotEntry.asset && snapshotEntry.asset_address && {
        asset_address: snapshotEntry.asset_address,
      }),
    }
  }
}

export default new RevenueSnapshotTransformer();
