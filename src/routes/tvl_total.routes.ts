'use strict';

import { body } from 'express-validator';

import Router from "./Router";

Router.get('/tvl-totals/silo/:deploymentID/:siloAddressOrName', [], 'TvlTotalController@getTvlTotalsBySilo');

Router.get('/tvl-totals/asset/:assetAddressOrSymbol/:siloAddressOrName', [], 'TvlTotalController@getTvlTotalsByAsset');

Router.get('/tvl-totals/whole-platform', [], 'TvlTotalController@getTvlTotalsWholePlatform');
Router.get('/tvl-totals/mv/whole-platform', [], 'TvlTotalController@getTvlTotalsWholePlatformMV');

Router.get('/tvl-totals/latest/assets/whole-platform', [], 'TvlTotalController@getTvlTotalsLatestAssetsWholePlatform');

Router.get('/tvl-totals/latest/assets/:deploymentID', [], 'TvlTotalController@getTvlTotalsLatestAssetsByDeploymentID');

module.exports = Router.export();