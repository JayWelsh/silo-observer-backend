'use strict';

import { body } from 'express-validator';

import Router from "./Router";

Router.get('/borrowed-totals/silo/:deploymentID/:siloAddressOrName', [], 'BorrowedTotalController@getBorrowedTotalsBySilo');

Router.get('/borrowed-totals/asset/:assetAddressOrSymbol', [], 'BorrowedTotalController@getBorrowedTotalsByAsset');

Router.get('/borrowed-totals/whole-platform', [], 'BorrowedTotalController@getBorrowedTotalsWholePlatform');

module.exports = Router.export();