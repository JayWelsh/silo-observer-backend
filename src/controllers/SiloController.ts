import { validationResult } from "express-validator";
import e, { Request, Response } from 'express';
import { utils } from "ethers";

import { SiloRepository } from '../database/repositories';

import Controller from './Controller';

class SiloController extends Controller {
  async getSiloByAddressOrName(req: Request, res: Response) {

    const {
      siloAddressOrName,
    } = req.params;

    let silo;
    if(utils.isAddress(siloAddressOrName)) {
      silo = await SiloRepository.getSiloByAddress(siloAddressOrName);
    } else {
      silo = await SiloRepository.getSiloByName(siloAddressOrName);
    }

    this.sendResponse(res, silo);
  }
  async getSilos(req: Request, res: Response) {

    const {
      siloAddress,
    } = req.params;

    const pagination = this.extractPagination(req)

    let silos = await SiloRepository.getSilos(pagination);

    this.sendResponse(res, silos);
  }
}

export default SiloController