import { validationResult } from "express-validator";
import e, { Request, Response } from 'express';
import { utils } from "ethers";

import { SiloRepository } from '../database/repositories';

import {
  SiloOutputTransformer
} from '../database/transformers';

import Controller from './Controller';

class SiloController extends Controller {
  async getSiloByAddressOrName(req: Request, res: Response) {

    const {
      siloAddressOrName,
      deploymentID,
    } = req.params;

    let silo;
    if(utils.isAddress(siloAddressOrName)) {
      silo = await SiloRepository.getSiloByAddress(siloAddressOrName, deploymentID, SiloOutputTransformer);
    } else {
      silo = await SiloRepository.getSiloByName(siloAddressOrName, deploymentID, SiloOutputTransformer);
    }

    this.sendResponse(res, silo);
  }
  async listSilos(req: Request, res: Response) {

    const pagination = this.extractPagination(req)

    let silos = await SiloRepository.listSilos(pagination, SiloOutputTransformer);

    this.sendResponse(res, silos);
  }
}

export default SiloController