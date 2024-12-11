import BaseTransformer from '../BaseTransformer';

import { IVolumeTimeseriesEntry } from "../../../interfaces";

class VolumeTimeseriesTransformer extends BaseTransformer {
  transform(volumeTimeseriesEntry: IVolumeTimeseriesEntry) {
    return {
      usd: volumeTimeseriesEntry.usd,
      day_timestamp_unix: Math.floor(new Date(volumeTimeseriesEntry.block_day_timestamp).getTime() / 1000),
      ...(volumeTimeseriesEntry.network && { network: volumeTimeseriesEntry.network })
    }
  }
}

export default new VolumeTimeseriesTransformer();
