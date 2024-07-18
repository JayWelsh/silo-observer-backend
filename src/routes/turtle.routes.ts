'use strict';

import { body } from 'express-validator';

import Router from "./Router";

Router.get('/turtle/user-tvl/:userAddress', [], 'TurtleController@getUserTvl');

module.exports = Router.export();