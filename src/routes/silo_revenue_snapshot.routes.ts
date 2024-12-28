'use strict';

import { body } from 'express-validator';

import Router from "./Router";

Router.get('/silo-revenue-snapshots/latest', [], 'SiloRevenueSnapshotController@getLatestSnapshots');
Router.get('/silo-revenue-snapshots/timeseries-distinct-networks', [], 'SiloRevenueSnapshotController@getTimeseriesDistinctNetworks');
Router.get('/silo-revenue-snapshots/timeseries-distinct-timestamps', [], 'SiloRevenueSnapshotController@getTimeseriesDistinctTimestamps');

module.exports = Router.export();