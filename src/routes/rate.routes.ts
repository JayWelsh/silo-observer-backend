'use strict';

import { body } from 'express-validator';

import Router from "./Router";

Router.get('/rates/silo/:siloAddressOrName', [], 'RateController@getRatesBySilo');

Router.get('/rates/asset/:assetAddressOrSymbol', [], 'RateController@getRatesByAsset');
Router.get('/rates/asset/:assetAddressOrSymbol/:side', [], 'RateController@getRatesByAsset');

module.exports = Router.export();