import express from "express";
import { Provider } from '@kargakis/ethers-multicall';
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import { Model } from "objection";
import Knex from "knex";
import {CronJob} from "cron";
import {providers} from "ethers";
import {
	NETWORK_TO_ALCHEMY_ENDPOINT,
} from "./constants"

import routes from "./routes";
import dbConfig from "./config/database";

import registerBotCommands from './tasks/register-bot-commands';
import botLoginAndReadyUp from './tasks/bot-login-and-ready-up';
import { periodicSiloDataTracker } from './tasks/periodic-silo-data-tracker';
import { periodicContractEventTracker } from './tasks/periodic-contract-event-tracker';
import { backfillEventUsdValues } from './tasks/data-patches/backfill-event-usd-values';
import { resycAllEventsUpToLastSyncedBlocks } from './tasks/data-patches/resync-all-events-up-to-last-synced-blocks';
import { periodicSubgraphLiquidationTracker } from "./tasks/periodic-subgraph-liquidation-tracker";

// minutely cycle to run indexer, 10 = 10 minutes (i.e. 10, 20, 30, 40, 50, 60 past the hour).
// recommend to use 10 if doing a full sync, once up to speed, 3 minutes should be safe.
// using 6 for Alchemy costs
let cronIndexerPeriodMinutes = 30; // temp until new month

let corsOptions = {
  origin: ['http://localhost:3000', 'https://silo.observer', 'https://www.silo.observer'],
}

dotenv.config();

// DB
const knex = Knex(dbConfig);
Model.knex(knex);

const app = express();
const port = process.env.PORT || 8000;

app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

routes(app);

app.listen(port);

console.log(`----- ⚡ SERVER LISTENING ⚡ -----`);
console.log(`-------- ⚡ PORT: ${port} ⚡ --------`);

registerBotCommands();
let discordClient = botLoginAndReadyUp();

// web3

// ETH MAINNET
export const EthersProvider = new providers.JsonRpcProvider(NETWORK_TO_ALCHEMY_ENDPOINT["ethereum"]);
export const MulticallProvider = new Provider(EthersProvider);
MulticallProvider.init();

// ARBITRUM MAINNET
export const EthersProviderArbitrum = new providers.JsonRpcProvider(NETWORK_TO_ALCHEMY_ENDPOINT["arbitrum"]);
export const MulticallProviderArbitrum = new Provider(EthersProviderArbitrum, 42161);
MulticallProviderArbitrum.init();

// OPTIMISM MAINNET
export const EthersProviderOptimism = new providers.JsonRpcProvider(NETWORK_TO_ALCHEMY_ENDPOINT["optimism"]);
export const MulticallProviderOptimism = new Provider(EthersProviderOptimism, 10);
MulticallProviderOptimism.init();

const runSync = new CronJob(
	`20 */${cronIndexerPeriodMinutes} * * * *`, // runs at 20 seconds past the minute at which it runs
	async () => {
		let useTimestampUnixSiloDataTracker = Math.floor(new Date().setSeconds(0) / 1000);
    let startTimeSiloDataTracker = new Date().getTime();
		console.log("Running SiloDataTracker", new Date(useTimestampUnixSiloDataTracker * 1000));
    await periodicSiloDataTracker(useTimestampUnixSiloDataTracker, startTimeSiloDataTracker);
    let useTimestampUnixContractEventTracker = Math.floor(new Date().setSeconds(0) / 1000);
    let startTimeContractEventTracker = new Date().getTime();
		console.log("Running ContractEventIndexer", new Date(useTimestampUnixContractEventTracker * 1000));
    await periodicContractEventTracker(useTimestampUnixContractEventTracker, startTimeContractEventTracker);
    let useTimestampUnixSubgraphLiquidationTracker = Math.floor(new Date().setSeconds(0) / 1000);
    let startTimeSubgraphLiquidationTracker = new Date().getTime();
    console.log("Running SubgraphLiquidationTracker", new Date(useTimestampUnixSubgraphLiquidationTracker  * 1000));
    await periodicSubgraphLiquidationTracker(useTimestampUnixSubgraphLiquidationTracker, startTimeSubgraphLiquidationTracker);
	},
	null,
	true,
	'Etc/UTC'
);

runSync.start();

(async () => {
  let startTimeResyncEvents = new Date().getTime();
  let useTimestampUnixResyncEvents = Math.floor(new Date().setSeconds(0) / 1000);
	resycAllEventsUpToLastSyncedBlocks(useTimestampUnixResyncEvents, startTimeResyncEvents);
  // backfillEventUsdValues();
})();