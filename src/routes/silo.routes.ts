'use strict';

import { body } from 'express-validator';

import Router from "./Router";

Router.get('/silo/:deploymentID/:siloAddressOrName', [], 'SiloController@getSiloByAddressOrName');

Router.get('/silos', [], 'SiloController@listSilos');

module.exports = Router.export();