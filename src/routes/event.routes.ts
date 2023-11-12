'use strict';

import { body } from 'express-validator';

import Router from "./Router";

Router.get('/events', [], 'EventController@getEventsWholePlatform');
Router.get('/events/rewards', [], 'EventController@getRewardEvents');
Router.get('/events/:eventType', [], 'EventController@getEventsWholePlatform');
Router.get('/events/:eventType/distinct-daily-users', [], 'EventController@getEventsDistinctUsersPerDayWholePlatform');
Router.get('/events/:eventType/:siloAddressOrName', [], 'EventController@getEventsBySilo');

module.exports = Router.export();