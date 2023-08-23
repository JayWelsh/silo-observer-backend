'use strict';

import { body } from 'express-validator';

import Router from "./Router";

Router.get('/rates/silo/:deploymentID/:siloAddressOrName', [], 'RateController@getRatesBySilo');

Router.get('/rates/asset/:deploymentID/:assetAddressOrSymbol', [], 'RateController@getRatesByAsset');
Router.get('/rates/asset/:deploymentID/:assetAddressOrSymbol/:side', [], 'RateController@getRatesByAsset');

module.exports = Router.export();