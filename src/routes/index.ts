'use strict';

import { Express } from "express";

const SiloRoutes = require('./silo.routes');
const RateRoutes = require('./rate.routes');

export default function routes(app: Express) {
    app.use("", SiloRoutes);
    app.use("", RateRoutes);
}