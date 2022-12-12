import { validationResult } from "express-validator";
import e, { Request, Response } from 'express';
import { utils } from "ethers";

import {
  TvlMinutelyRepository,
  TvlHourlyRepository,
} from '../database/repositories';

import {
  TvlTotalOutputTransformer
} from '../database/transformers';

import Controller from './Controller';

class TvlTotalController extends Controller {
  async getTvlTotalsBySilo(req: Request, res: Response) {

    const {
      siloAddressOrName,
    } = req.params;

    const {
      resolution = 'minutely'
    } = req.query;

    const pagination = this.extractPagination(req)

    let borrowedTotals;
    if(utils.isAddress(siloAddressOrName)) {
      if(resolution === 'minutely') {
        borrowedTotals = await TvlMinutelyRepository.getTvlTotalsBySiloAddress(siloAddressOrName, pagination, TvlTotalOutputTransformer);
      }
      if(resolution === 'hourly') {
        borrowedTotals = await TvlHourlyRepository.getTvlTotalsBySiloAddress(siloAddressOrName, pagination, TvlTotalOutputTransformer);
      }
    } else {
      if(resolution === 'minutely') {
        borrowedTotals = await TvlMinutelyRepository.getTvlTotalsBySiloName(siloAddressOrName, pagination, TvlTotalOutputTransformer);
      }
      if(resolution === 'hourly') {
        borrowedTotals = await TvlHourlyRepository.getTvlTotalsBySiloName(siloAddressOrName, pagination, TvlTotalOutputTransformer);
      }
    }

    this.sendResponse(res, borrowedTotals);
  }
  async getTvlTotalsByAsset(req: Request, res: Response) {

    const {
      assetAddressOrSymbol,
    } = req.params;

    const {
      resolution = 'minutely'
    } = req.query;

    const pagination = this.extractPagination(req)

    let borrowedTotals;
    if(utils.isAddress(assetAddressOrSymbol)) {
      if(resolution === 'minutely') {
        borrowedTotals = await TvlMinutelyRepository.getTvlTotalsByAssetAddress(assetAddressOrSymbol, pagination, TvlTotalOutputTransformer);
      }
      if(resolution === 'hourly') {
        borrowedTotals = await TvlHourlyRepository.getTvlTotalsByAssetAddress(assetAddressOrSymbol, pagination, TvlTotalOutputTransformer);
      }
    } else {
      if(resolution === 'minutely') {
        borrowedTotals = await TvlMinutelyRepository.getTvlTotalsByAssetSymbol(assetAddressOrSymbol, pagination, TvlTotalOutputTransformer);
      }
      if(resolution === 'hourly') {
        borrowedTotals = await TvlHourlyRepository.getTvlTotalsByAssetSymbol(assetAddressOrSymbol, pagination, TvlTotalOutputTransformer);
      }
    }

    this.sendResponse(res, borrowedTotals);
  }
  async getTvlTotalsWholePlatform(req: Request, res: Response) {

    const {
      resolution = 'minutely'
    } = req.query;

    const pagination = this.extractPagination(req)

    let borrowedTotals;
    if(resolution === 'minutely') {
      borrowedTotals = await TvlMinutelyRepository.getTvlTotalsWholePlatform(pagination, TvlTotalOutputTransformer);
    }
    if(resolution === 'hourly') {
      borrowedTotals = await TvlHourlyRepository.getTvlTotalsWholePlatform(pagination, TvlTotalOutputTransformer);
    }

    this.sendResponse(res, borrowedTotals);
  }
}

export default TvlTotalController;