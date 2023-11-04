import { validationResult } from "express-validator";
import e, { Request, Response } from 'express';
import { utils } from "ethers";

import {
  DepositEventRepository,
  WithdrawEventRepository,
  RepayEventRepository,
  BorrowEventRepository,
} from '../database/repositories';

import {
  VolumeTimeseriesTransformer,
} from '../database/transformers';

import Controller from './Controller';

class VolumeController extends Controller {
  async getDepositVolumes(req: Request, res: Response) {

    const {
      order = "ASC"
    } = req.params;

    const pagination = this.extractPagination(req)

    let volumeTimeseries = await DepositEventRepository.getDailyDepositTotals(pagination, order, VolumeTimeseriesTransformer)

    this.sendResponse(res, volumeTimeseries);
  }

  async getWithdrawVolumes(req: Request, res: Response) {

    const {
      order = "ASC"
    } = req.params;

    const pagination = this.extractPagination(req)

    let volumeTimeseries = await WithdrawEventRepository.getDailyWithdrawTotals(pagination, order, VolumeTimeseriesTransformer)

    this.sendResponse(res, volumeTimeseries);
  }

  async getRepayVolumes(req: Request, res: Response) {

    const {
      order = "ASC"
    } = req.params;

    const pagination = this.extractPagination(req)

    let volumeTimeseries = await RepayEventRepository.getDailyRepayTotals(pagination, order, VolumeTimeseriesTransformer)

    this.sendResponse(res, volumeTimeseries);
  }

  async getBorrowVolumes(req: Request, res: Response) {

    const {
      order = "ASC"
    } = req.params;

    const pagination = this.extractPagination(req)

    let volumeTimeseries = await BorrowEventRepository.getDailyBorrowTotals(pagination, order, VolumeTimeseriesTransformer)

    this.sendResponse(res, volumeTimeseries);
  }
}

export default VolumeController;