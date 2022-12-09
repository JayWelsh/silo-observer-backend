'use strict';

import { body } from 'express-validator';

import Router from "./Router";

Router.get('/silo/:siloAddressOrName', [], 'SiloController@getSiloByAddressOrName');

module.exports = Router.export();