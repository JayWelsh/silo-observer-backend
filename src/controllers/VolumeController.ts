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

    let {
      order = "ASC",
      period,
      networks,
    } = req.query;

    period = period as string;
    networks = networks as string;


    let parsedNetworks : string[] = [];
    if(networks) {
      parsedNetworks = networks.split(',')
    }

    const pagination = this.extractPagination(req)

    let volumeTimeseries = await DepositEventRepository.getDailyDepositTotals(pagination, order === "DESC" ? "DESC" : "ASC", period, parsedNetworks, VolumeTimeseriesTransformer)

    this.sendResponse(res, volumeTimeseries);
  }

  async getWithdrawVolumes(req: Request, res: Response) {

    let {
      order = "ASC",
      period,
      networks,
    } = req.query;

    period = period as string;
    networks = networks as string;


    let parsedNetworks : string[] = [];
    if(networks) {
      parsedNetworks = networks.split(',')
    }

    const pagination = this.extractPagination(req)

    let volumeTimeseries = await WithdrawEventRepository.getDailyWithdrawTotals(pagination, order === "DESC" ? "DESC" : "ASC", period, parsedNetworks, VolumeTimeseriesTransformer)

    this.sendResponse(res, volumeTimeseries);
  }

  async getRepayVolumes(req: Request, res: Response) {

    let {
      order = "ASC",
      period,
      networks,
    } = req.query;

    period = period as string;
    networks = networks as string;


    let parsedNetworks : string[] = [];
    if(networks) {
      parsedNetworks = networks.split(',')
    }

    const pagination = this.extractPagination(req)

    let volumeTimeseries = await RepayEventRepository.getDailyRepayTotals(pagination, order === "DESC" ? "DESC" : "ASC", period, parsedNetworks, VolumeTimeseriesTransformer)

    this.sendResponse(res, volumeTimeseries);
  }

  async getBorrowVolumes(req: Request, res: Response) {

    let {
      order = "ASC",
      period,
      networks,
    } = req.query;

    period = period as string;
    networks = networks as string;


    let parsedNetworks : string[] = [];
    if(networks) {
      parsedNetworks = networks.split(',')
    }

    const pagination = this.extractPagination(req)

    let volumeTimeseries = await BorrowEventRepository.getDailyBorrowTotals(pagination, order === "DESC" ? "DESC" : "ASC", period, parsedNetworks, VolumeTimeseriesTransformer)

    this.sendResponse(res, volumeTimeseries);
  }
}

export default VolumeController;