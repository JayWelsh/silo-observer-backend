import BaseTransformer from '../BaseTransformer';

import { ITvlTotal } from "../../../interfaces";

class TvlTotalOutputTransformer extends BaseTransformer {
  transform(tvlTotalEntry: ITvlTotal) {
      return {
        tvl: tvlTotalEntry.tvl,
        timestamp: tvlTotalEntry.timestamp,
        meta: tvlTotalEntry.meta,
        ...(tvlTotalEntry.silo && { 
          silo:{
            name: tvlTotalEntry.silo.name,
            address: tvlTotalEntry.silo.address,
            input_token_address: tvlTotalEntry.silo.input_token_address
          }
        }),
        ...(tvlTotalEntry.asset && {
          asset: {
            address: tvlTotalEntry.asset.address,
            symbol: tvlTotalEntry.asset.symbol,
            decimals: tvlTotalEntry.asset.decimals,
          }
        }),
      }
  }
}

export default new TvlTotalOutputTransformer();
