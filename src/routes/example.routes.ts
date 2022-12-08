'use strict';

import { body } from 'express-validator';

import Router from "./Router";

Router.get('/silo/:siloAddress', [], 'SiloController@getSiloByAddress');

Router.get('/silos', [], 'SiloController@getSilos');

module.exports = Router.export();
