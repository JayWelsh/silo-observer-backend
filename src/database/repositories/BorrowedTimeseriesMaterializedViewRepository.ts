import { QueryBuilder } from "objection";

import { BorrowedTimeseriesMaterializedViewModel } from "../models";
import BorrowedBaseRepository from "./BorrowedBaseRepository";

import Pagination, { IPaginationRequest } from "../../utils/Pagination";
import { ITransformer } from "../../interfaces";

import {
  BORROWED_TIMESERIES_MATERIALIZED_VIEW,
} from '../tables';

class BorrowedTimeseriesMaterializedViewRepository extends BorrowedBaseRepository {
  getModel() {
    return BorrowedTimeseriesMaterializedViewModel
  }

  async getBorrowedTotalsWholePlatformNew(
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

    let tableName = this.model.tableName;

    const { 
      perPage,
      page
    } = pagination;

    let materializedViewToUse = BORROWED_TIMESERIES_MATERIALIZED_VIEW;

    const results = await this.model.query()
      .from(materializedViewToUse)
      .modify((queryBuilder: QueryBuilder<BorrowedTimeseriesMaterializedViewModel>) => {
          if (networksArray) {
            queryBuilder.whereIn('network', networksArray);
          }
          if (versionsArray) {
            queryBuilder.whereIn('protocol_version', versionsArray);
          }
      })
      .select(
          this.model.raw('sum(borrowed::numeric) as borrowed'),
          'timestamp',
      )
      .groupBy('timestamp')
      .orderBy('timestamp', 'DESC')
      .page(page - 1, perPage);

    return this.parserResult(new Pagination(results, perPage, page), transformer);
  }

  async refreshBorrowedTimeseriesMaterializedView(): Promise<void> {
    let materializedViewToUse = BORROWED_TIMESERIES_MATERIALIZED_VIEW;
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

export default new BorrowedTimeseriesMaterializedViewRepository();