'use strict';

import { Express } from "express";

const SiloRoutes = require('./silo.routes');
const RateRoutes = require('./rate.routes');
const TvlTotalRoutes = require('./tvl_total.routes');
const BorrowedTotalRoutes = require('./borrowed_total.routes');
const EventRoutes = require('./event.routes');

export default function routes(app: Express) {
    app.use("", SiloRoutes);
    app.use("", RateRoutes);
    app.use("", TvlTotalRoutes);
    app.use("", BorrowedTotalRoutes);
    app.use("", EventRoutes);
}