'use strict';

import { body } from 'express-validator';

import Router from "./Router";

Router.get('/rewards/cumulative', [], 'RewardController@getCumulativeRewards');

module.exports = Router.export();