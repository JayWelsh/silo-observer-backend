'use strict';

import { body } from 'express-validator';

import Router from "./Router";

Router.get('/rewards/cumulative', [], 'RewardController@getCumulativeRewards');

Router.get('/rewards/merkl/tags', [], 'RewardController@getMerklTags');

module.exports = Router.export();