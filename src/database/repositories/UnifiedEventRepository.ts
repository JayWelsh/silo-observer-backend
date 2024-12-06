import { QueryBuilder, raw } from "objection";
import BaseRepository from "./BaseRepository";
import { UnifiedEventModel } from "../models";
import Pagination, { IPaginationRequest } from "../../utils/Pagination";
import { ITransformer } from "../../interfaces";

class UnifiedEventRepository extends BaseRepository {
  getModel() {
    return UnifiedEventModel;
  }

  async refreshMaterializedView(): Promise<void> {
    try {
      console.time('refresh_materialized_view');
      await this.model.knex().raw('REFRESH MATERIALIZED VIEW CONCURRENTLY unified_events_materialized');
      console.timeEnd('refresh_materialized_view');
    } catch (error) {
      console.error('Failed to refresh materialized view:', error);
      throw error;
    }
  }

  async getUnifiedEvents(
    pagination: IPaginationRequest,
    networks: string[] | undefined,
    transformer: ITransformer,
  ) {
    const { perPage, page } = pagination;
    let tableName = this.model.tableName;

    const results = await this.model.query()
      .withGraphJoined('[silo, asset]')
      .select([
        `${tableName}.event_name`,
        `${tableName}.amount`,
        `${tableName}.user_address`,
        `${tableName}.tx_hash`,
        `${tableName}.usd_value_at_event_time`,
        `${tableName}.deployment_id`,
        `${tableName}.event_fingerprint`,
        `${tableName}.block_hash`,
        `${tableName}.block_timestamp`,
        `${tableName}.block_timestamp_unix`,
        `${tableName}.network`,
        `${tableName}.block_day_timestamp`,
      ])
      .whereNotNull(`${tableName}.block_timestamp`)
      .where(function (this: QueryBuilder<UnifiedEventModel>) {
        if(networks) {
          for(let [index, network] of networks.entries()) {
            if(index === 0) {
              this.where(`${tableName}.network`, '=', network);
            } else {
              this.orWhere(`${tableName}.network`, '=', network);
            }
          }
        }
      })
      .orderBy('block_timestamp_unix', 'DESC')
      .page(page - 1, perPage);

    return this.parserResult(new Pagination(results, perPage, page), transformer);
  }

}

export default new UnifiedEventRepository();