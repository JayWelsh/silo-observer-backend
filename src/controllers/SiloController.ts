import { validationResult } from "express-validator";
import { Request, Response } from 'express';

import { SiloRepository } from '../database/repositories';

import Controller from './Controller';

class SiloController extends Controller {
  async getSiloByAddress(req: Request, res: Response) {

    const {
      siloAddress,
    } = req.params;

    let silo = await SiloRepository.getSiloByAddress(siloAddress);

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