import { validationResult } from "express-validator";
import e, { Request, Response } from 'express';
import { utils } from "ethers";

import {
  BorrowedMinutelyRepository,
  BorrowedHourlyRepository,
  BorrowedTimeseriesMaterializedViewRepository,
} from '../database/repositories';

import {
  BorrowedTotalOutputTransformer
} from '../database/transformers';

import Controller from './Controller';

class BorrowedTotalController extends Controller {
  async getBorrowedTotalsBySilo(req: Request, res: Response) {

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
        borrowedTotals = await BorrowedMinutelyRepository.getBorrowedTotalsBySiloAddress(siloAddressOrName, deploymentID, pagination, BorrowedTotalOutputTransformer);
      }
      if(resolution === 'hourly') {
        borrowedTotals = await BorrowedHourlyRepository.getBorrowedTotalsBySiloAddress(siloAddressOrName, deploymentID, pagination, BorrowedTotalOutputTransformer);
      }
    } else {
      if(resolution === 'minutely') {
        borrowedTotals = await BorrowedMinutelyRepository.getBorrowedTotalsBySiloName(siloAddressOrName, deploymentID, pagination, BorrowedTotalOutputTransformer);
      }
      if(resolution === 'hourly') {
        borrowedTotals = await BorrowedHourlyRepository.getBorrowedTotalsBySiloName(siloAddressOrName, deploymentID, pagination, BorrowedTotalOutputTransformer);
      }
    }

    this.sendResponse(res, borrowedTotals);
  }
  async getBorrowedTotalsByAsset(req: Request, res: Response) {

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
        borrowedTotals = await BorrowedMinutelyRepository.getBorrowedTotalsByAssetAddress(assetAddressOrSymbol, deploymentID, pagination, BorrowedTotalOutputTransformer);
      }
      if(resolution === 'hourly') {
        borrowedTotals = await BorrowedHourlyRepository.getBorrowedTotalsByAssetAddress(assetAddressOrSymbol, deploymentID, pagination, BorrowedTotalOutputTransformer);
      }
    } else {
      if(resolution === 'minutely') {
        borrowedTotals = await BorrowedMinutelyRepository.getBorrowedTotalsByAssetSymbol(assetAddressOrSymbol, deploymentID, pagination, BorrowedTotalOutputTransformer);
      }
      if(resolution === 'hourly') {
        borrowedTotals = await BorrowedHourlyRepository.getBorrowedTotalsByAssetSymbol(assetAddressOrSymbol, deploymentID, pagination, BorrowedTotalOutputTransformer);
      }
    }

    this.sendResponse(res, borrowedTotals);
  }
  async getBorrowedTotalsWholePlatform(req: Request, res: Response) {

    let {
      resolution = 'minutely',
      networks,
    } = req.query;

    networks = networks as string;

    let parsedNetworks : string[] = [];
    if(networks) {
      parsedNetworks = networks.split(',')
    }

    const pagination = this.extractPagination(req)

    let borrowedTotals;
    if(resolution === 'minutely') {
      borrowedTotals = await BorrowedMinutelyRepository.getBorrowedTotalsWholePlatform(pagination, parsedNetworks, BorrowedTotalOutputTransformer);
    }
    if(resolution === 'hourly') {
      borrowedTotals = await BorrowedHourlyRepository.getBorrowedTotalsWholePlatform(pagination, parsedNetworks, BorrowedTotalOutputTransformer);
    }

    this.sendResponse(res, borrowedTotals);
  }

  async getBorrowedTotalsWholePlatformMV(req: Request, res: Response) {

    let {
      networks,
    } = req.query;

    networks = networks as string;

    let parsedNetworks : string[] = [];
    if(networks) {
      parsedNetworks = networks.split(',')
    }

    const pagination = this.extractPagination(req)

    let borrowedTotals = await BorrowedTimeseriesMaterializedViewRepository.getBorrowedTotalsWholePlatformNew(pagination, parsedNetworks, BorrowedTotalOutputTransformer);

    this.sendResponse(res, borrowedTotals);
  }
}

export default BorrowedTotalController;