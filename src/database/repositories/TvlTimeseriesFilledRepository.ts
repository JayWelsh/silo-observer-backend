import { QueryBuilder } from "objection";

import { TvlTimeseriesFilledModel } from "../models";
import TvlBaseRepository from "./TvlBaseRepository";
import Pagination, { IPaginationRequest } from "../../utils/Pagination";
import { ITransformer } from "../../interfaces";

import {
  TVL_TIMESERIES_FILLED,
} from '../tables';

class TvlTimeseriesFilledRepository extends TvlBaseRepository {
  getModel() {
    return TvlTimeseriesFilledModel
  }

  async getTvlTotalsWholePlatformNew(
    pagination: IPaginationRequest,
    networks: string | string[] | undefined,
    versions: string | string[] | undefined,
    transformer: ITransformer,
  ) {

    const networksArray = typeof networks === 'string' 
      ? networks.split(',')
      : networks;

    const versionsArray = typeof versions === 'string' 
      ? versions.split(',')
      : versions;

    const { 
      perPage,
      page
    } = pagination;

    let materializedViewToUse = TVL_TIMESERIES_FILLED;

    const results = await this.model.query()
      .from(materializedViewToUse)
      .modify((queryBuilder: QueryBuilder<TvlTimeseriesFilledModel>) => {
          if (networksArray) {
              queryBuilder.whereIn('network', networksArray);
          }
          if (versionsArray) {
            queryBuilder.whereIn('protocol_version', versionsArray);
          }
      })
      .select(
          this.model.raw('sum(tvl::numeric) as tvl'),
          'timestamp',
      )
      .groupBy('timestamp')
      .orderBy('timestamp', 'DESC')
      .page(page - 1, perPage);

    return this.parserResult(new Pagination(results, perPage, page), transformer);
  }

}

export default new TvlTimeseriesFilledRepository();