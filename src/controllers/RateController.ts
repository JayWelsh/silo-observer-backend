import { validationResult } from "express-validator";
import e, { Request, Response } from 'express';
import { utils } from "ethers";

import {
  RateRepository
} from '../database/repositories';

import Controller from './Controller';

class RateController extends Controller {
  async getRatesBySilo(req: Request, res: Response) {

    const {
      siloAddressOrName,
    } = req.params;

    const pagination = this.extractPagination(req)

    let rates;
    if(utils.isAddress(siloAddressOrName)) {
      rates = await RateRepository.getRatesBySiloAddress(siloAddressOrName, pagination);
    } else {
      rates = await RateRepository.getRatesBySiloName(siloAddressOrName, pagination);
    }

    console.log({rates})

    this.sendResponse(res, rates);
  }
}

export default RateController;