import Pagination from "../../utils/Pagination";
import BaseTransformer from "./../transformers/BaseTransformer";

interface ITransformer {
  transform?: (datum: any) => void;
}

abstract class BaseRepository {
    model: any;
    transformer?: ITransformer;
    transformerSkipped?: boolean;
    abstract getModel(): void;

    constructor() {
        this._init()
    }

    _init() {

        if (this.getModel === undefined) {
            throw new TypeError("Repository should have 'model' method defined.")
        }

        this.model = this.getModel()
        this.transformer = undefined;
        this.transformerSkipped = false
    }

    async create(data: any) {
        // console.log("INSERT DATA", data)
        const result = await this.model.query().insert(data)

        return this.parserResult(result)
    }

    async update(data: any, id: number) {
        // console.log("UPDATE DATA", id)
        await this.find(id)

        const result = await this.model.query().patchAndFetchById(id, data)

        return this.parserResult(result)
    }

    async delete(id: number) {
        await this.find(id)

        return await this.model.query().deleteById(id)
    }

    async find(id: number) {
        const result = await this.model.query().findById(id)

        if (!result) {
            return null;
        }

        return this.parserResult(result)
    }

    async findByColumn(column: string, value: string | number | boolean) {
        const result = await this.model.query().where(column, value)

        if (result.length === 0) {
            return null;
        }

        return this.parserResult(result[0])
    }

    async all() {
        const results = await this.model.query();

        return this.parserResult(results)
    }

    async paginate(perPage = 10, page = 1) {
        const results = await this.model.query().page(page - 1, perPage)

        return this.parserResult(new Pagination(results, perPage, page))
    }


    query() {
        return this.model.query()
    }

    setTransformer(transformer: ITransformer) {
        this.transformer = transformer

        return this
    }

    skipTransformer(skip = true) {
        this.transformerSkipped = skip
    }

    parserResult(data: any) {
        if (this.transformerSkipped || !(this.transformer instanceof BaseTransformer)) {
            return data instanceof Pagination ? data.get() : data
        }

        if (data instanceof Pagination && this.transformer) {
            const paginatedResults = data.get()
            const results = paginatedResults.data.map((datum: any) => this.transformer && this.transformer.transform && this.transformer.transform(datum))
            return {paginatedData: results, meta: {pagination: paginatedResults.pagination}}
        }

        return Array.isArray(data)
          ? data.map(datum => this.transformer && this.transformer.transform && this.transformer.transform(datum))
          : this.transformer && this.transformer.transform && this.transformer.transform(data)
    }
}

export default BaseRepository;
