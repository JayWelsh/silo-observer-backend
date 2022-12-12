'use strict';

import { body } from 'express-validator';

import Router from "./Router";

Router.get('/tvl-totals/silo/:siloAddressOrName', [], 'TvlTotalController@getTvlTotalsBySilo');

Router.get('/tvl-totals/asset/:assetAddressOrSymbol', [], 'TvlTotalController@getTvlTotalsByAsset');

Router.get('/tvl-totals/whole-platform', [], 'TvlTotalController@getTvlTotalsWholePlatform');

module.exports = Router.export();