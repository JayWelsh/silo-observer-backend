'use strict';

import { body } from 'express-validator';

import Router from "./Router";

Router.get('/volume/deposit', [], 'VolumeController@getDepositVolumes');

Router.get('/volume/withdraw', [], 'VolumeController@getWithdrawVolumes');

Router.get('/volume/repay', [], 'VolumeController@getRepayVolumes');

Router.get('/volume/borrow', [], 'VolumeController@getBorrowVolumes');

module.exports = Router.export();