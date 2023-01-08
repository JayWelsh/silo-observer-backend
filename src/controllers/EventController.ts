import { validationResult } from "express-validator";
import e, { Request, Response } from 'express';
import { utils } from "ethers";

import {
  EventIndexerBlockTrackerRepository,
  BorrowEventRepository,
  DepositEventRepository,
  WithdrawEventRepository,
  RepayEventRepository,
  BlockMetadataRepository,
} from '../database/repositories';

import {
  SiloUserEventOutputTransformer,
  SiloUserEventDistinctDailyUsersOutputTransformer,
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

    const pagination = this.extractPagination(req)

    let events;

    if(eventType === 'borrow') {
      events = await BorrowEventRepository.getBorrowEvents(pagination, SiloUserEventOutputTransformer);
    } else if(eventType === 'deposit') {
      events = await DepositEventRepository.getDepositEvents(pagination, SiloUserEventOutputTransformer);
    } else if(eventType === 'repay') {
      events = await RepayEventRepository.getRepayEvents(pagination, SiloUserEventOutputTransformer);
    } else if(eventType === 'withdraw') {
      events = await WithdrawEventRepository.getWithdrawEvents(pagination, SiloUserEventOutputTransformer);
    }

    this.sendResponse(res, events);
  }
  async getEventsDistinctUsersPerDayWholePlatform(req: Request, res: Response) {

    const {
      eventType,
    } = req.params;

    const {
      page,
      perPage
    } = req.query;

    const pagination = this.extractPagination(req);

    const skipPagination = !page && !perPage;

    let events;

    if(eventType === 'borrow') {
      events = await BorrowEventRepository.getBorrowEventsDistinctUsersPerDay(pagination, SiloUserEventDistinctDailyUsersOutputTransformer, skipPagination);
    } else if(eventType === 'deposit') {
      events = await DepositEventRepository.getDepositEventsDistinctUsersPerDay(pagination, SiloUserEventDistinctDailyUsersOutputTransformer, skipPagination);
    } else if(eventType === 'repay') {
      events = await RepayEventRepository.getRepayEventsDistinctUsersPerDay(pagination, SiloUserEventDistinctDailyUsersOutputTransformer, skipPagination);
    } else if(eventType === 'withdraw') {
      events = await WithdrawEventRepository.getWithdrawEventsDistinctUsersPerDay(pagination, SiloUserEventDistinctDailyUsersOutputTransformer, skipPagination);
    }

    this.sendResponse(res, events);
  }
}

export default EventController;