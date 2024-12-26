'use strict';

import { body } from 'express-validator';

import Router from "./Router";

Router.get('/silo-revenue-snapshots/latest', [], 'SiloRevenueSnapshotController@getLatestSnapshots');

module.exports = Router.export();