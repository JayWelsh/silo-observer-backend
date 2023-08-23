import BaseTransformer from '../BaseTransformer';

import { IBorrowedTotal } from "../../../interfaces";

class BorrowedTotalOutputTransformer extends BaseTransformer {
  transform(borrowedTotalEntry: IBorrowedTotal) {
    return {
      borrowed: borrowedTotalEntry.borrowed,
      timestamp: borrowedTotalEntry.timestamp,
      meta: borrowedTotalEntry.meta,
      network: borrowedTotalEntry.network,
      deployment_id: borrowedTotalEntry.deployment_id,
      ...(borrowedTotalEntry.silo && { 
        silo:{
          name: borrowedTotalEntry.silo.name,
          address: borrowedTotalEntry.silo.address,
          input_token_address: borrowedTotalEntry.silo.input_token_address
        }
      }),
      ...(borrowedTotalEntry.asset && {
        asset: {
          address: borrowedTotalEntry.asset.address,
          symbol: borrowedTotalEntry.asset.symbol,
          decimals: borrowedTotalEntry.asset.decimals,
        }
      }),
    }
  }
}

export default new BorrowedTotalOutputTransformer();
