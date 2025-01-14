import { validationResult } from "express-validator";
import e, { Request, Response } from 'express';
import { utils } from "ethers";

import {
  TvlTimeseriesMaterializedViewRepository,
  TvlMinutelyRepository,
  TvlHourlyRepository,
  TvlLatestRepository,
} from '../database/repositories';

import {
  TvlTotalOutputTransformer
} from '../database/transformers';

import Controller from './Controller';

class TvlTotalController extends Controller {
  async getTvlTotalsBySilo(req: Request, res: Response) {

    const {
      siloAddressOrName,
      deploymentID,
    } = req.params;

    const {
      resolution = 'minutely'
    } = req.query;

    const pagination = this.extractPagination(req)

    let borrowedTotals;
    if(utils.isAddress(siloAddressOrName)) {
      if(resolution === 'minutely') {
        borrowedTotals = await TvlMinutelyRepository.getTvlTotalsBySiloAddress(siloAddressOrName, deploymentID, pagination, TvlTotalOutputTransformer);
      }
      if(resolution === 'hourly') {
        borrowedTotals = await TvlHourlyRepository.getTvlTotalsBySiloAddress(siloAddressOrName, deploymentID, pagination, TvlTotalOutputTransformer);
      }
    } else {
      if(resolution === 'minutely') {
        borrowedTotals = await TvlMinutelyRepository.getTvlTotalsBySiloName(siloAddressOrName, deploymentID, pagination, TvlTotalOutputTransformer);
      }
      if(resolution === 'hourly') {
        borrowedTotals = await TvlHourlyRepository.getTvlTotalsBySiloName(siloAddressOrName, deploymentID, pagination, TvlTotalOutputTransformer);
      }
    }

    this.sendResponse(res, borrowedTotals);
  }
  async getTvlTotalsByAsset(req: Request, res: Response) {

    const {
      assetAddressOrSymbol,
      deploymentID,
    } = req.params;

    const {
      resolution = 'minutely'
    } = req.query;

    const pagination = this.extractPagination(req)

    let borrowedTotals;
    if(utils.isAddress(assetAddressOrSymbol)) {
      if(resolution === 'minutely') {
        borrowedTotals = await TvlMinutelyRepository.getTvlTotalsByAssetAddress(assetAddressOrSymbol, deploymentID, pagination, TvlTotalOutputTransformer);
      }
      if(resolution === 'hourly') {
        borrowedTotals = await TvlHourlyRepository.getTvlTotalsByAssetAddress(assetAddressOrSymbol, deploymentID, pagination, TvlTotalOutputTransformer);
      }
    } else {
      if(resolution === 'minutely') {
        borrowedTotals = await TvlMinutelyRepository.getTvlTotalsByAssetSymbol(assetAddressOrSymbol, deploymentID, pagination, TvlTotalOutputTransformer);
      }
      if(resolution === 'hourly') {
        borrowedTotals = await TvlHourlyRepository.getTvlTotalsByAssetSymbol(assetAddressOrSymbol, deploymentID, pagination, TvlTotalOutputTransformer);
      }
    }

    this.sendResponse(res, borrowedTotals);
  }
  async getTvlTotalsWholePlatform(req: Request, res: Response) {

    let {
      resolution = 'minutely',
      networks,
      versions,
    } = req.query;

    networks = networks as string;

    let parsedNetworks : string[] = [];
    if(networks) {
      parsedNetworks = networks.split(',')
    }

    versions = versions as string;

    let parsedVersions : string[] = [];
    if(versions) {
      parsedVersions = versions.split(',');
    }

    const pagination = this.extractPagination(req)

    let borrowedTotals;
    if(resolution === 'minutely') {
      borrowedTotals = await TvlMinutelyRepository.getTvlTotalsWholePlatform(pagination, parsedNetworks, parsedVersions, TvlTotalOutputTransformer);
    }
    if(resolution === 'hourly') {
      borrowedTotals = await TvlHourlyRepository.getTvlTotalsWholePlatform(pagination, parsedNetworks, parsedVersions, TvlTotalOutputTransformer);
    }

    this.sendResponse(res, borrowedTotals);
  }

  async getTvlTotalsWholePlatformMV(req: Request, res: Response) {

    let {
      networks,
      versions,
    } = req.query;

    networks = networks as string;

    let parsedNetworks : string[] = [];
    if(networks) {
      parsedNetworks = networks.split(',')
    }

    versions = versions as string;

    let parsedVersions : string[] = [];
    if(versions) {
      parsedVersions = versions.split(',');
    }

    const pagination = this.extractPagination(req)

    let tvlTotals = await TvlTimeseriesMaterializedViewRepository.getTvlTotalsWholePlatformNew(pagination, parsedNetworks, parsedVersions, TvlTotalOutputTransformer);

    this.sendResponse(res, tvlTotals);
  }

  async getTvlTotalsLatestAssetsByDeploymentID(req: Request, res: Response) {

    const {
      deploymentID,
    } = req.params;

    let allRecords = await TvlLatestRepository.getLatestResultsGroupedByAssetsByDeploymentID(deploymentID);

    this.sendResponse(res, allRecords);

  }
  async getTvlTotalsLatestAssetsWholePlatform(req: Request, res: Response) {

    let {
      networks,
      versions,
    } = req.query;

    networks = networks as string;

    let parsedNetworks : string[] = [];
    if(networks) {
      parsedNetworks = networks.split(',')
    }

    versions = versions as string;

    let parsedVersions : string[] = [];
    if(versions) {
      parsedVersions = versions.split(',');
    }

    let allRecords = await TvlLatestRepository.getLatestResultsGroupedByAssetsWholePlatform(parsedNetworks, parsedVersions);

    this.sendResponse(res, allRecords);

  }
}

export default TvlTotalController;