import { SiloModel } from "../models";
import BaseRepository from "./BaseRepository";
import { QueryBuilder } from "objection";

import Pagination, { IPaginationRequest } from "../../utils/Pagination";
import { ITransformer } from "../../interfaces";

import {
  SILO_BLACKLIST,
} from '../../constants';

class SiloRepository extends BaseRepository {
    getModel() {
      return SiloModel
    }

    async getSiloByAddress(
      siloAddress: string | number,
      deploymentID: string,
      transformer?: ITransformer,
    ) {

      let tableName = this.model.tableName;

      const result = await this.model.query()
      .withGraphFetched("latest_rates.[asset]")
      .where(function (this: QueryBuilder<SiloModel>) {
        this.where('address', siloAddress);
        this.where(`${tableName}.deployment_id`, deploymentID);
      }).first();

      return this.parserResult(result, transformer)
    }
    
    async getSiloByName(
      siloName: string,
      deploymentID: string,
      transformer: ITransformer,
    ) {

      let tableName = this.model.tableName;

      const result = await this.model.query()
      .withGraphJoined("latest_rates.[asset]")
      .where(function (this: QueryBuilder<SiloModel>) {
        this.where('name', siloName);
        if(deploymentID) {
          this.where(`${tableName}.deployment_id`, deploymentID);
          this.where(`latest_rates.deployment_id`, deploymentID);
        }
      }).first();

      return this.parserResult(result, transformer)
    }

    async listSilos(
      pagination: IPaginationRequest,
      transformer: ITransformer,
    ) {

      const { perPage, page } = pagination;

      const results = await this.model.query()
        .withGraphFetched("latest_rates")
        .whereNotIn("address", SILO_BLACKLIST)
        .orderBy("tvl", "DESC")
        .page(page - 1, perPage);
      
      return this.parserResult(new Pagination(results, perPage, page), transformer)
    }
}

export default new SiloRepository()
