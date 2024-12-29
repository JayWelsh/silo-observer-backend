'use strict';

import { body } from 'express-validator';

import Router from "./Router";

Router.get('/borrowed-totals/silo/:deploymentID/:siloAddressOrName', [], 'BorrowedTotalController@getBorrowedTotalsBySilo');

Router.get('/borrowed-totals/asset/:assetAddressOrSymbol', [], 'BorrowedTotalController@getBorrowedTotalsByAsset');

Router.get('/borrowed-totals/whole-platform', [], 'BorrowedTotalController@getBorrowedTotalsWholePlatform');
Router.get('/borrowed-totals/mv/whole-platform', [], 'BorrowedTotalController@getBorrowedTotalsWholePlatformMV');

module.exports = Router.export();