import { SiloModel } from "../models";
import BaseRepository from "./BaseRepository";
import { QueryBuilder } from "objection";

import Pagination, { IPaginationRequest } from "../../utils/Pagination";
import { ITransformer } from "../../interfaces";

class SiloRepository extends BaseRepository {
    getModel() {
      return SiloModel
    }

    async getSiloByAddress(
      siloAddress: string | number,
      transformer: ITransformer,
    ) {
      const result = await this.model.query().where(function (this: QueryBuilder<SiloModel>) {
        this.where('address', siloAddress);
      }).first();

      return this.parserResult(result, transformer)
    }
    
    async getSiloByName(
      siloName: string,
      transformer: ITransformer,
    ) {
      const result = await this.model.query().where(function (this: QueryBuilder<SiloModel>) {
        this.where('name', siloName);
      }).first();

      return this.parserResult(result, transformer)
    }

    async listSilos(
      pagination: IPaginationRequest,
      transformer: ITransformer,
    ) {

      const { perPage, page } = pagination;

      const results = await this.model.query().page(page - 1, perPage);
      
      return this.parserResult(new Pagination(results, perPage, page), transformer)
    }
}

export default new SiloRepository()
