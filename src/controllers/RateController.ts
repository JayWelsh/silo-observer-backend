import { validationResult } from "express-validator";
import e, { Request, Response } from 'express';
import { utils } from "ethers";

import {
  RateRepository
} from '../database/repositories';

import {
  RateOutputTransformer
} from '../database/transformers';

import Controller from './Controller';

class RateController extends Controller {
  async getRatesBySilo(req: Request, res: Response) {

    const {
      siloAddressOrName,
    } = req.params;

    const pagination = this.extractPagination(req)

    let rates;
    if(utils.isAddress(siloAddressOrName)) {
      rates = await RateRepository.getRatesBySiloAddress(siloAddressOrName, pagination, RateOutputTransformer);
    } else {
      rates = await RateRepository.getRatesBySiloName(siloAddressOrName, pagination, RateOutputTransformer);
    }

    this.sendResponse(res, rates);
  }
  async getRatesByAsset(req: Request, res: Response) {

    const {
      assetAddressOrName,
      side,
    } = req.params;

    const pagination = this.extractPagination(req)

    let rates;
    if(utils.isAddress(assetAddressOrName)) {
      rates = await RateRepository.getRatesByAssetAddress(assetAddressOrName, side?.toUpperCase(), pagination, RateOutputTransformer);
    } else {
      rates = await RateRepository.getRatesByAssetName(assetAddressOrName, side?.toUpperCase(), pagination, RateOutputTransformer);
    }

    this.sendResponse(res, rates);
  }
}

export default RateController;