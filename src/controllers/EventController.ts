import { validationResult } from "express-validator";
import e, { Request, Response } from 'express';
import { utils } from "ethers";

import {
  EventIndexerBlockTrackerRepository,
  BorrowEventRepository,
  DepositEventRepository,
  WithdrawEventRepository,
  RepayEventRepository,
  RewardEventRepository,
  BlockMetadataRepository,
  SubgraphLiquidationRecordRepository,
  UnifiedEventRepository,
} from '../database/repositories';

import {
  SiloUserEventOutputTransformer,
  SiloUserEventDistinctDailyUsersOutputTransformer,
  SubgraphLiquidationRecordTransformer,
  SiloUserEventMaterializedViewTransformer,
} from '../database/transformers';

import Controller from './Controller';

class EventController extends Controller {
  async getEventsBySilo(req: Request, res: Response) {

    const {
      eventType,
      siloAddressOrName,
    } = req.params;

    const pagination = this.extractPagination(req)

    let events;
    if(utils.isAddress(siloAddressOrName)) {
      if(eventType === 'borrow') {
        events = await BorrowEventRepository.getBorrowEventsBySiloAddress(siloAddressOrName, pagination, SiloUserEventOutputTransformer);
      } else if(eventType === 'deposit') {
        events = await DepositEventRepository.getDepositEventsBySiloAddress(siloAddressOrName, pagination, SiloUserEventOutputTransformer);
      } else if(eventType === 'repay') {
        events = await RepayEventRepository.getRepayEventsBySiloAddress(siloAddressOrName, pagination, SiloUserEventOutputTransformer);
      } else if(eventType === 'withdraw') {
        events = await WithdrawEventRepository.getWithdrawEventsBySiloAddress(siloAddressOrName, pagination, SiloUserEventOutputTransformer);
      }
    } else {
      if(eventType === 'borrow') {
        events = await BorrowEventRepository.getBorrowEventsBySiloName(siloAddressOrName, pagination, SiloUserEventOutputTransformer);
      } else if(eventType === 'deposit') {
        events = await DepositEventRepository.getDepositEventsBySiloName(siloAddressOrName, pagination, SiloUserEventOutputTransformer);
      } else if(eventType === 'repay') {
        events = await RepayEventRepository.getRepayEventsBySiloName(siloAddressOrName, pagination, SiloUserEventOutputTransformer);
      } else if(eventType === 'withdraw') {
        events = await WithdrawEventRepository.getWithdrawEventsBySiloName(siloAddressOrName, pagination, SiloUserEventOutputTransformer);
      }
    }

    this.sendResponse(res, events);
  }
  async getEventsWholePlatform(req: Request, res: Response) {

    const {
      eventType,
    } = req.params;

    let {
      networks,
      versions,
    } = req.query;

    networks = networks as string;

    let parsedNetworks : string[] = [];
    if(networks) {
      parsedNetworks = networks.split(',')
    }

    versions = versions as string;

    let parsedVersions : string[] = [];
    if(versions) {
      parsedVersions = versions.split(',');
    }

    const pagination = this.extractPagination(req)

    let events;

    if(eventType === 'borrow') {
      events = await BorrowEventRepository.getBorrowEvents(pagination, parsedNetworks, parsedVersions, SiloUserEventOutputTransformer);
    } else if(eventType === 'deposit') {
      events = await DepositEventRepository.getDepositEvents(pagination, parsedNetworks, parsedVersions, SiloUserEventOutputTransformer);
    } else if(eventType === 'repay') {
      events = await RepayEventRepository.getRepayEvents(pagination, parsedNetworks, parsedVersions, SiloUserEventOutputTransformer);
    } else if(eventType === 'withdraw') {
      events = await WithdrawEventRepository.getWithdrawEvents(pagination, parsedNetworks, parsedVersions, SiloUserEventOutputTransformer);
    } else if(eventType === 'liquidation') {
      events = await SubgraphLiquidationRecordRepository.getLiquidationRecords(pagination, parsedNetworks, parsedVersions, SubgraphLiquidationRecordTransformer);
    } else if(eventType === 'legacy') {
      events = await BorrowEventRepository.getUnifiedEvents(pagination, parsedNetworks, parsedVersions, SiloUserEventOutputTransformer);
    } else {
      events = await UnifiedEventRepository.getUnifiedEvents(pagination, parsedNetworks, parsedVersions, SiloUserEventMaterializedViewTransformer);
    }

    this.sendResponse(res, events);
  }
  async getEventsDistinctUsersPerDayWholePlatform(req: Request, res: Response) {

    const {
      eventType,
    } = req.params;

    let {
      page,
      perPage,
      networks,
      versions,
    } = req.query;

    networks = networks as string;

    let parsedNetworks : string[] = [];
    if(networks) {
      parsedNetworks = networks.split(',')
    }

    versions = versions as string;

    let parsedVersions : string[] = [];
    if(versions) {
      parsedVersions = versions.split(',');
    }

    const pagination = this.extractPagination(req);

    const skipPagination = !page && !perPage;

    let events;

    if(eventType === 'borrow') {
      events = await BorrowEventRepository.getBorrowEventsDistinctUsersPerDay(pagination, parsedNetworks, parsedVersions, SiloUserEventDistinctDailyUsersOutputTransformer, skipPagination);
    } else if(eventType === 'deposit') {
      events = await DepositEventRepository.getDepositEventsDistinctUsersPerDay(pagination, parsedNetworks, parsedVersions, SiloUserEventDistinctDailyUsersOutputTransformer, skipPagination);
    } else if(eventType === 'repay') {
      events = await RepayEventRepository.getRepayEventsDistinctUsersPerDay(pagination, parsedNetworks, parsedVersions, SiloUserEventDistinctDailyUsersOutputTransformer, skipPagination);
    } else if(eventType === 'withdraw') {
      events = await WithdrawEventRepository.getWithdrawEventsDistinctUsersPerDay(pagination, parsedNetworks, parsedVersions, SiloUserEventDistinctDailyUsersOutputTransformer, skipPagination);
    }

    this.sendResponse(res, events);
  }
  async getRewardEvents(req: Request, res: Response) {

    let {
      networks,
      versions,
    } = req.query;

    networks = networks as string;

    let parsedNetworks : string[] = [];
    if(networks) {
      parsedNetworks = networks.split(',')
    }

    versions = versions as string;

    let parsedVersions : string[] = [];
    if(versions) {
      parsedVersions = versions.split(',');
    }

    const pagination = this.extractPagination(req)

    let events = await RewardEventRepository.getRewardEvents(pagination, parsedNetworks, parsedVersions, SiloUserEventOutputTransformer);

    this.sendResponse(res, events);
  }
}

export default EventController;