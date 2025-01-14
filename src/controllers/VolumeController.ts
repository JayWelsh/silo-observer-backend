import { validationResult } from "express-validator";
import e, { Request, Response } from 'express';
import { utils } from "ethers";

import {
  DepositEventRepository,
  WithdrawEventRepository,
  RepayEventRepository,
  BorrowEventRepository,
  SubgraphLiquidationRecordRepository,
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
      versions,
      groupBy,
    } = req.query;

    period = period as string;
    networks = networks as string;
    versions = versions as string;
    groupBy = groupBy as string;

    let parsedNetworks : string[] = [];
    if(networks) {
      parsedNetworks = networks.split(',')
    }

    let parsedVersions : string[] = [];
    if(versions) {
      parsedVersions = versions.split(',')
    }

    const pagination = this.extractPagination(req)

    let volumeTimeseries;
    
    if(groupBy === 'network') {
      volumeTimeseries = await DepositEventRepository.getDailyDepositTotalsGroupedByNetwork(pagination, order === "DESC" ? "DESC" : "ASC", period, parsedNetworks, parsedVersions, VolumeTimeseriesTransformer);
    } else {
      volumeTimeseries = await DepositEventRepository.getDailyDepositTotals(pagination, order === "DESC" ? "DESC" : "ASC", period, parsedNetworks, parsedVersions, VolumeTimeseriesTransformer);
    }

    this.sendResponse(res, volumeTimeseries);
  }

  async getWithdrawVolumes(req: Request, res: Response) {
    let {
      order = "ASC",
      period,
      networks,
      versions,
      groupBy,
    } = req.query;

    period = period as string;
    networks = networks as string;
    versions = versions as string;
    groupBy = groupBy as string;

    let parsedNetworks : string[] = [];
    if(networks) {
      parsedNetworks = networks.split(',')
    }

    let parsedVersions : string[] = [];
    if(versions) {
      parsedVersions = versions.split(',')
    }

    const pagination = this.extractPagination(req)

    let volumeTimeseries;
    
    if(groupBy === 'network') {
      volumeTimeseries = await WithdrawEventRepository.getDailyWithdrawTotalsGroupedByNetwork(pagination, order === "DESC" ? "DESC" : "ASC", period, parsedNetworks, parsedVersions, VolumeTimeseriesTransformer);
    } else {
      volumeTimeseries = await WithdrawEventRepository.getDailyWithdrawTotals(pagination, order === "DESC" ? "DESC" : "ASC", period, parsedNetworks, parsedVersions, VolumeTimeseriesTransformer);
    }

    this.sendResponse(res, volumeTimeseries);
  }

  async getRepayVolumes(req: Request, res: Response) {
    let {
      order = "ASC",
      period,
      networks,
      versions,
      groupBy,
    } = req.query;

    period = period as string;
    networks = networks as string;
    versions = versions as string;
    groupBy = groupBy as string;

    let parsedNetworks : string[] = [];
    if(networks) {
      parsedNetworks = networks.split(',')
    }

    let parsedVersions : string[] = [];
    if(versions) {
      parsedVersions = versions.split(',')
    }

    const pagination = this.extractPagination(req)

    let volumeTimeseries;
    
    if(groupBy === 'network') {
      volumeTimeseries = await RepayEventRepository.getDailyRepayTotalsGroupedByNetwork(pagination, order === "DESC" ? "DESC" : "ASC", period, parsedNetworks, parsedVersions, VolumeTimeseriesTransformer);
    } else {
      volumeTimeseries = await RepayEventRepository.getDailyRepayTotals(pagination, order === "DESC" ? "DESC" : "ASC", period, parsedNetworks, parsedVersions, VolumeTimeseriesTransformer);
    }

    this.sendResponse(res, volumeTimeseries);
  }

  async getBorrowVolumes(req: Request, res: Response) {

    let {
      order = "ASC",
      period,
      networks,
      versions,
      groupBy,
    } = req.query;

    period = period as string;
    networks = networks as string;
    versions = versions as string;
    groupBy = groupBy as string;


    let parsedNetworks : string[] = [];
    if(networks) {
      parsedNetworks = networks.split(',')
    }

    let parsedVersions : string[] = [];
    if(versions) {
      parsedVersions = versions.split(',')
    }

    const pagination = this.extractPagination(req)

    let volumeTimeseries;
    
    if(groupBy === 'network') {
      volumeTimeseries = await BorrowEventRepository.getDailyBorrowTotalsGroupedByNetwork(pagination, order === "DESC" ? "DESC" : "ASC", period, parsedNetworks, parsedVersions, VolumeTimeseriesTransformer);
    } else {
      volumeTimeseries = await BorrowEventRepository.getDailyBorrowTotals(pagination, order === "DESC" ? "DESC" : "ASC", period, parsedNetworks, parsedVersions, VolumeTimeseriesTransformer);
    }
    
    this.sendResponse(res, volumeTimeseries);
  }

  async getLiquidationVolumes(req: Request, res: Response) {
    let {
      order = "ASC",
      period,
      networks,
      versions,
      groupBy,
    } = req.query;

    period = period as string;
    networks = networks as string;
    versions = versions as string;
    groupBy = groupBy as string;

    let parsedNetworks : string[] = [];
    if(networks) {
      parsedNetworks = networks.split(',')
    }

    let parsedVersions : string[] = [];
    if(versions) {
      parsedVersions = versions.split(',')
    }

    const pagination = this.extractPagination(req)

    let volumeTimeseries;
    
    if(groupBy === 'network') {
      volumeTimeseries = await SubgraphLiquidationRecordRepository.getDailyLiquidationTotalsGroupedByNetwork(pagination, order === "DESC" ? "DESC" : "ASC", period, parsedNetworks, parsedVersions, VolumeTimeseriesTransformer);
    } else {
      volumeTimeseries = await SubgraphLiquidationRecordRepository.getDailyLiquidationTotals(pagination, order === "DESC" ? "DESC" : "ASC", period, parsedNetworks, parsedVersions, VolumeTimeseriesTransformer);
    }

    this.sendResponse(res, volumeTimeseries);
  }
}

export default VolumeController;