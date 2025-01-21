import { QueryBuilder } from "objection";

import { BorrowedTimeseriesMaterializedViewModel } from "../models";
import BorrowedBaseRepository from "./BorrowedBaseRepository";

import Pagination, { IPaginationRequest } from "../../utils/Pagination";
import { ITransformer } from "../../interfaces";

import {
  BORROWED_TIMESERIES_WITH_GAPS_MATERIALIZED_VIEW,
  BORROWED_TIMESERIES_FILLED,
} from '../tables';

import {
  fillTimeseriesGaps,
} from '../../utils';

let materializedViewToUse = BORROWED_TIMESERIES_WITH_GAPS_MATERIALIZED_VIEW;
let filledGapsTable = BORROWED_TIMESERIES_FILLED;

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

    const { 
      perPage,
      page
    } = pagination;

    let materializedViewToUse = BORROWED_TIMESERIES_WITH_GAPS_MATERIALIZED_VIEW;

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
    try {
      console.time(`refresh_${materializedViewToUse}`);
      await this.model.knex().raw(`REFRESH MATERIALIZED VIEW CONCURRENTLY ${materializedViewToUse}`);
      console.timeEnd(`refresh_${materializedViewToUse}`);
      console.time(`fill_gaps_from_${materializedViewToUse}`);
      await this.refreshGapFilledData();
      console.timeEnd(`fill_gaps_from_${materializedViewToUse}`);
    } catch (error) {
      console.error(`Failed to refresh ${materializedViewToUse} materialized view:`, error);
      throw error;
    }
  }

  async refreshGapFilledData(): Promise<void> {

    const deployments = await this.model.query()
      .from(materializedViewToUse)
      .distinct('deployment_id', 'network');

    // Update gap-filled data for each deployment
    await this.model.query().from(filledGapsTable).truncate();
    for (const dep of deployments) {
      await this.updateGapFilledData(dep.deployment_id, dep.network);
    }
  }

  async updateGapFilledData(deploymentId: string, network: string) {
    // Fetch raw data from materialized view
    const rawData = await this.model.knex().raw(`
      SELECT timestamp, network, deployment_id, protocol_version, borrowed::text
      FROM ${materializedViewToUse} 
      WHERE deployment_id = ? AND network = ?
      ORDER BY timestamp
    `, [deploymentId, network]);
  
    if (rawData?.rows?.length === 0) return;
  
    // Get time range
    const startTime = rawData?.rows?.[0].timestamp;
    const endTime = new Date(); // or rawData[rawData.length - 1].timestamp if you don't want to fill up to now
  
    // Fill gaps
    const filledData = fillTimeseriesGaps(rawData?.rows, 'borrowed', startTime, endTime);
  
    // Batch insert/update to the filled table
    const BATCH_SIZE = 1000;
    for (let i = 0; i < filledData.length; i += BATCH_SIZE) {
      const batch = filledData.slice(i, i + BATCH_SIZE);
      
      await this.model.query().from(filledGapsTable)
        .insert(batch.map(point => ({
          timestamp: point.timestamp,
          network: point.network,
          deployment_id: point.deployment_id,
          protocol_version: point.protocol_version,
          borrowed: point.borrowed,
          last_updated: new Date()
        })))
        .onConflict(['timestamp', 'network', 'deployment_id', 'protocol_version'])
        .merge(['borrowed', 'last_updated']);
    }
  }
}

export default new BorrowedTimeseriesMaterializedViewRepository();