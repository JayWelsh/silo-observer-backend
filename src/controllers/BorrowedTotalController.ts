import { validationResult } from "express-validator";
import e, { Request, Response } from 'express';
import { utils } from "ethers";

import {
  BorrowedMinutelyRepository,
  BorrowedHourlyRepository
} from '../database/repositories';

import {
  BorrowedTotalOutputTransformer
} from '../database/transformers';

import Controller from './Controller';

class BorrowedTotalController extends Controller {
  async getBorrowedTotalsBySilo(req: Request, res: Response) {

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
        borrowedTotals = await BorrowedMinutelyRepository.getBorrowedTotalsBySiloAddress(siloAddressOrName, pagination, BorrowedTotalOutputTransformer);
      }
      if(resolution === 'hourly') {
        borrowedTotals = await BorrowedHourlyRepository.getBorrowedTotalsBySiloAddress(siloAddressOrName, pagination, BorrowedTotalOutputTransformer);
      }
    } else {
      if(resolution === 'minutely') {
        borrowedTotals = await BorrowedMinutelyRepository.getBorrowedTotalsBySiloName(siloAddressOrName, pagination, BorrowedTotalOutputTransformer);
      }
      if(resolution === 'hourly') {
        borrowedTotals = await BorrowedHourlyRepository.getBorrowedTotalsBySiloName(siloAddressOrName, pagination, BorrowedTotalOutputTransformer);
      }
    }

    this.sendResponse(res, borrowedTotals);
  }
  async getBorrowedTotalsByAsset(req: Request, res: Response) {

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
        borrowedTotals = await BorrowedMinutelyRepository.getBorrowedTotalsByAssetAddress(assetAddressOrSymbol, pagination, BorrowedTotalOutputTransformer);
      }
      if(resolution === 'hourly') {
        borrowedTotals = await BorrowedHourlyRepository.getBorrowedTotalsByAssetAddress(assetAddressOrSymbol, pagination, BorrowedTotalOutputTransformer);
      }
    } else {
      if(resolution === 'minutely') {
        borrowedTotals = await BorrowedMinutelyRepository.getBorrowedTotalsByAssetSymbol(assetAddressOrSymbol, pagination, BorrowedTotalOutputTransformer);
      }
      if(resolution === 'hourly') {
        borrowedTotals = await BorrowedHourlyRepository.getBorrowedTotalsByAssetSymbol(assetAddressOrSymbol, pagination, BorrowedTotalOutputTransformer);
      }
    }

    this.sendResponse(res, borrowedTotals);
  }
  async getBorrowedTotalsWholePlatform(req: Request, res: Response) {

    const {
      resolution = 'minutely'
    } = req.query;

    const pagination = this.extractPagination(req)

    let borrowedTotals;
    if(resolution === 'minutely') {
      borrowedTotals = await BorrowedMinutelyRepository.getBorrowedTotalsWholePlatform(pagination, BorrowedTotalOutputTransformer);
    }
    if(resolution === 'hourly') {
      borrowedTotals = await BorrowedHourlyRepository.getBorrowedTotalsWholePlatform(pagination, BorrowedTotalOutputTransformer);
    }

    this.sendResponse(res, borrowedTotals);
  }
}

export default BorrowedTotalController;