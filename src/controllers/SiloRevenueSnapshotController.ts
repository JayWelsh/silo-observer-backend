import { validationResult } from "express-validator";
import e, { Request, Response } from 'express';
import { utils } from "ethers";

import {
  SiloRevenueSnapshotRepository,
} from '../database/repositories';

import {
  SiloRevenueOutputTransformer
} from '../database/transformers';

import Controller from './Controller';

class SiloRevenueSnapshotController extends Controller {

  async getSnapshotsBySilo(req: Request, res: Response) {

    const {
      siloAddressOrName,
      deploymentID,
    } = req.params;

    const pagination = this.extractPagination(req)

    let snapshots;
    if(utils.isAddress(siloAddressOrName)) {
      snapshots = await SiloRevenueSnapshotRepository.getSnapshotsBySiloAddress(siloAddressOrName, deploymentID, pagination, SiloRevenueOutputTransformer);
    } else {
      snapshots = await SiloRevenueSnapshotRepository.getSnapshotsBySiloName(siloAddressOrName, deploymentID, pagination, SiloRevenueOutputTransformer);
    }

    this.sendResponse(res, snapshots);
  }
  async getSnapshotsByAsset(req: Request, res: Response) {

    const {
      assetAddressOrSymbol,
      deploymentID,
    } = req.params;

    const pagination = this.extractPagination(req)

    let snapshots;
    if(utils.isAddress(assetAddressOrSymbol)) {
      snapshots = await SiloRevenueSnapshotRepository.getSnapshotsByAssetAddress(assetAddressOrSymbol, deploymentID, pagination, SiloRevenueOutputTransformer);
    } else {
      snapshots = await SiloRevenueSnapshotRepository.getSnapshotsByAssetSymbol(assetAddressOrSymbol, deploymentID, pagination, SiloRevenueOutputTransformer);
    }

    this.sendResponse(res, snapshots);
  }
}

export default SiloRevenueSnapshotController;