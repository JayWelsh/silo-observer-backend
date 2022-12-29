import BaseTransformer from '../BaseTransformer';

import { ISiloUserEvent } from "../../../interfaces";

class SiloUserEventDistinctDailyUsersOutputTransformer extends BaseTransformer {
  transform(event: ISiloUserEvent) {
    return {
      user_address: event.user_address,
      ...(event.block_day_timestamp && {
        block_day_timestamp: event.block_day_timestamp
      })
    }
  }
}

export default new SiloUserEventDistinctDailyUsersOutputTransformer();
