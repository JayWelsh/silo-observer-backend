import { QueryBuilder } from "objection";

import { TvlTimeseriesMaterializedViewModel } from "../models";
import TvlBaseRepository from "./TvlBaseRepository";
import Pagination, { IPaginationRequest } from "../../utils/Pagination";
import { ITransformer } from "../../interfaces";

import {
  TVL_TIMESERIES_MATERIALIZED_VIEW,
} from '../tables';

class TvlTimeseriesMaterializedViewRepository extends TvlBaseRepository {
  getModel() {
    return TvlTimeseriesMaterializedViewModel
  }

  async getTvlTotalsWholePlatformNew(
    pagination: IPaginationRequest,
    networks: string | string[] | undefined,
    transformer: ITransformer,
  ) {

    const networksArray = typeof networks === 'string' 
      ? networks.split(',')
      : networks;

    let tableName = this.model.tableName;

    const { 
      perPage,
      page
    } = pagination;

    let materializedViewToUse = TVL_TIMESERIES_MATERIALIZED_VIEW;

    const results = await this.model.query()
      .from(materializedViewToUse)
      .modify((queryBuilder: QueryBuilder<TvlTimeseriesMaterializedViewModel>) => {
          if (networksArray) {
              queryBuilder.whereIn('network', networksArray);
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

  async refreshTvlTimeseriesMaterializedView(): Promise<void> {
    let materializedViewToUse = TVL_TIMESERIES_MATERIALIZED_VIEW;
    try {
      console.time(`refresh_${materializedViewToUse}`);
      await this.model.knex().raw(`REFRESH MATERIALIZED VIEW CONCURRENTLY ${materializedViewToUse}`);
      console.timeEnd(`refresh_${materializedViewToUse}`);
    } catch (error) {
      console.error(`Failed to refresh ${materializedViewToUse} materialized view:`, error);
      throw error;
    }
  }

}

export default new TvlTimeseriesMaterializedViewRepository();