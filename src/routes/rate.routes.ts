'use strict';

import { body } from 'express-validator';

import Router from "./Router";

Router.get('/rates/:siloAddressOrName', [], 'RateController@getRatesBySilo');

module.exports = Router.export();