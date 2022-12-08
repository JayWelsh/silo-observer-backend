import { SiloModel } from "../models";
import BaseRepository from "./BaseRepository";
import { QueryBuilder } from "objection";
import Pagination, { IPaginationRequest } from "../../utils/Pagination";

class SiloRepository extends BaseRepository {
    getModel() {
      return SiloModel
    }

    async getSiloByAddress(siloAddress: string | number) {
      const result = await this.model.query().where(function (this: QueryBuilder<SiloModel>) {
        this.where('address', siloAddress);
      }).first();

      return this.parserResult(result)
    }

    async getSilos(pagination: IPaginationRequest) {

      const { perPage, page } = pagination;

      const results = await this.model.query().page(page - 1, perPage);
      
      return this.parserResult(new Pagination(results, perPage, page))
    }
}

export default new SiloRepository()
