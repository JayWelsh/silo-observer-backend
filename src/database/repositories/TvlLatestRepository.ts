import { QueryBuilder, raw } from "objection";

import { TvlLatestModel } from "../models";
import TvlBaseRepository from "./TvlBaseRepository";

class TvlLatestRepository extends TvlBaseRepository {
  getModel() {
    return TvlLatestModel
  }

  async getLatestResultByNetworkAndMetaAndDeploymentID(network: string, meta: string, deploymentID: string) {

    let tableName = TvlLatestModel.tableName;

    const result = await TvlLatestModel.query().where(function (this: QueryBuilder<TvlLatestModel>) {
      this.where('network', network);
      this.where('meta', meta);
      this.where(`${tableName}.deployment_id`, deploymentID);
    }).orderBy('timestamp', 'DESC').first();

    return this.parserResult(result);
  }

  async getLatestResultByNetworkAndSiloAddressAndAssetAddressAndDeploymentID(network: string, siloAddress: string, assetAddress: string, deploymentID: string) {

    let tableName = TvlLatestModel.tableName;

    const result = await TvlLatestModel.query().where(function (this: QueryBuilder<TvlLatestModel>) {
      this.where('network', network);
      this.where('silo_address', siloAddress);
      this.where('asset_address', assetAddress);
      this.where(`${tableName}.deployment_id`, deploymentID);
    }).orderBy('timestamp', 'DESC').first();

    return this.parserResult(result);
  }

  async getLatestResultsGroupedByAssetsByDeploymentID(deploymentID: string) {

    let tableName = TvlLatestModel.tableName;

    const result = await TvlLatestModel.query()
      .withGraphFetched('asset')
      .where(function (this: QueryBuilder<TvlLatestModel>) {
        this.where(`${tableName}.deployment_id`, deploymentID);
        this.whereNotNull('asset_address');
      })
      .select(raw('SUM(tvl) AS tvl'))
      .groupBy(`${tableName}.asset_address`)
      .orderBy('tvl', 'DESC')

    return this.parserResult(result);

  }

  async getLatestResultsGroupedByAssetsWholePlatform() {

    let tableName = TvlLatestModel.tableName;

    const result = await TvlLatestModel.query()
      .withGraphFetched('asset')
      .where(function (this: QueryBuilder<TvlLatestModel>) {
        this.whereNotNull('asset_address');
      })
      .select(raw('SUM(tvl) AS tvl'))
      .groupBy(`${tableName}.asset_address`)
      .orderBy('tvl', 'DESC')

    return this.parserResult(result);

  }
}

export default new TvlLatestRepository();