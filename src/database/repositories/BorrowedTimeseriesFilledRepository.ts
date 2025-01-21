import { QueryBuilder } from "objection";

import { BorrowedTimeseriesFilledModel } from "../models";
import BorrowedBaseRepository from "./BorrowedBaseRepository";
import Pagination, { IPaginationRequest } from "../../utils/Pagination";
import { ITransformer } from "../../interfaces";

import {
  BORROWED_TIMESERIES_FILLED,
} from '../tables';

class BorrowedTimeseriesFilledRepository extends BorrowedBaseRepository {
  getModel() {
    return BorrowedTimeseriesFilledModel
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

    const { 
      perPage,
      page
    } = pagination;

    let materializedViewToUse = BORROWED_TIMESERIES_FILLED;

    const results = await this.model.query()
      .from(materializedViewToUse)
      .modify((queryBuilder: QueryBuilder<BorrowedTimeseriesFilledModel>) => {
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

}

export default new BorrowedTimeseriesFilledRepository();