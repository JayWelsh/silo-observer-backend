import e, { Request, Response } from 'express';

import {
  RewardEventRepository,
} from '../database/repositories';

import Controller from './Controller';

class RewardController extends Controller {
  async getCumulativeRewards(req: Request, res: Response) {

    let {
      networks,
    } = req.query;

    networks = networks as string;

    let parsedNetworks : string[] = [];
    if(networks) {
      parsedNetworks = networks.split(',')
    }

    let events = await RewardEventRepository.getCumulativeRewardsPerAddress(parsedNetworks);

    this.sendResponse(res, events);
  }
}

export default RewardController;