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
      rates = await RateRepository.setTransformer(RateOutputTransformer).getRatesBySiloAddress(siloAddressOrName, pagination);
    } else {
      rates = await RateRepository.setTransformer(RateOutputTransformer).getRatesBySiloName(siloAddressOrName, pagination);
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
      rates = await RateRepository.setTransformer(RateOutputTransformer).getRatesByAssetAddress(assetAddressOrName, side, pagination);
    } else {
      rates = await RateRepository.setTransformer(RateOutputTransformer).getRatesByAssetName(assetAddressOrName, side, pagination);
    }

    this.sendResponse(res, rates);
  }
}

export default RateController;