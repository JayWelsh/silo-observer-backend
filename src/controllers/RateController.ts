import { validationResult } from "express-validator";
import e, { Request, Response } from 'express';
import { utils } from "ethers";

import {
  RateRepository,
  RateHourlyRepository
} from '../database/repositories';

import {
  RateOutputTransformer
} from '../database/transformers';

import Controller from './Controller';

class RateController extends Controller {
  async getRatesBySilo(req: Request, res: Response) {

    const {
      siloAddressOrName,
      deploymentID,
    } = req.params;

    const {
      resolution = 'minutely'
    } = req.query;

    const pagination = this.extractPagination(req)

    let rates;
    if(utils.isAddress(siloAddressOrName)) {
      if(resolution === 'minutely') {
        rates = await RateRepository.getRatesBySiloAddress(siloAddressOrName, deploymentID, pagination, RateOutputTransformer);
      }
      if(resolution === 'hourly') {
        rates = await RateHourlyRepository.getRatesBySiloAddress(siloAddressOrName, deploymentID, pagination, RateOutputTransformer);
      }
    } else {
      if(resolution === 'minutely') {
        rates = await RateRepository.getRatesBySiloName(siloAddressOrName, deploymentID, pagination, RateOutputTransformer);
      }
      if(resolution === 'hourly') {
        rates = await RateHourlyRepository.getRatesBySiloName(siloAddressOrName, deploymentID, pagination, RateOutputTransformer);
      }
    }

    this.sendResponse(res, rates);
  }
  async getRatesByAsset(req: Request, res: Response) {

    const {
      assetAddressOrSymbol,
      side,
      deploymentID,
    } = req.params;

    const {
      resolution = 'minutely'
    } = req.query;

    const pagination = this.extractPagination(req)

    let rates;
    if(utils.isAddress(assetAddressOrSymbol)) {
      if(resolution === 'minutely') {
        rates = await RateRepository.getRatesByAssetAddress(assetAddressOrSymbol, deploymentID, side?.toUpperCase(), pagination, RateOutputTransformer);
      }
      if(resolution === 'hourly') {
        rates = await RateHourlyRepository.getRatesByAssetAddress(assetAddressOrSymbol, deploymentID, side?.toUpperCase(), pagination, RateOutputTransformer);
      }
    } else {
      if(resolution === 'minutely') {
        rates = await RateRepository.getRatesByAssetSymbol(assetAddressOrSymbol, deploymentID, side?.toUpperCase(), pagination, RateOutputTransformer);
      }
      if(resolution === 'hourly') {
        rates = await RateHourlyRepository.getRatesByAssetSymbol(assetAddressOrSymbol, deploymentID, side?.toUpperCase(), pagination, RateOutputTransformer);
      }
    }

    this.sendResponse(res, rates);
  }
}

export default RateController;