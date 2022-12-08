'use strict';

import { Express } from "express";

const ExampleRoutes = require('./example.routes')

export default function routes(app: Express) {
    app.use("", ExampleRoutes);
}