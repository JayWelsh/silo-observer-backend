import express from "express";
import { Provider } from 'ethers-multicall';
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import { Model } from "objection";
import Knex from "knex";
import {CronJob} from "cron";
import {providers} from "ethers";
import {
  ALCHEMY_API_KEY,
	ALCHEMY_API_KEY_ARBITRUM,
} from "./constants"

import routes from "./routes";
import dbConfig from "./config/database";

import registerBotCommands from './tasks/register-bot-commands';
import botLoginAndReadyUp from './tasks/bot-login-and-ready-up';
import { periodicSiloDataTracker } from './tasks/periodic-silo-data-tracker';
import { periodicContractEventTracker } from './tasks/periodic-contract-event-tracker';
import { backfillEventUsdValues } from './tasks/data-patches/backfill-event-usd-values';

// minutely cycle to run indexer, 10 = 10 minutes (i.e. 10, 20, 30, 40, 50, 60 past the hour).
// recommend to use 10 if doing a full sync, once up to speed, 3 minutes should be safe.
// using 6 for Alchemy costs
let contractEventIndexerPeriodMinutes = 20; // temp until new month

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
export const EthersProvider = new providers.AlchemyWebSocketProvider("homestead", ALCHEMY_API_KEY);
export const MulticallProvider = new Provider(EthersProvider);
MulticallProvider.init();

// ARBITRUM
export const EthersProviderArbitrum = new providers.AlchemyWebSocketProvider("arbitrum", ALCHEMY_API_KEY_ARBITRUM);
export const MulticallProviderArbitrum = new Provider(EthersProviderArbitrum, 42161);
MulticallProviderArbitrum.init();

// const runContractEventIndexer = new CronJob(
// 	`15 */${contractEventIndexerPeriodMinutes} * * * *`, // runs at 40 seconds past the minute on contractEventIndexerPeriodMinutes to offset it from the minutely runner which usually takes around 30 seconds
// 	function() {
//     let useTimestampUnix = Math.floor(new Date().setSeconds(0) / 1000);
//     let startTime = new Date().getTime();
// 		console.log("Running ContractEventIndexer", useTimestampUnix);
//     periodicContractEventTracker(useTimestampUnix, startTime);
// 	},
// 	null,
// 	true,
// 	'Etc/UTC'
// );

// runContractEventIndexer.start();

// const runSiloDataTracker = new CronJob(
// 	// '15 */4 * * * *',
// 	'30 */15 * * * *', // temp decrease until new month
// 	function() {
    let useTimestampUnix = Math.floor(new Date().setSeconds(0) / 1000);
    let startTime = new Date().getTime();
		console.log("Running SiloDataTracker", useTimestampUnix);
    periodicSiloDataTracker(useTimestampUnix, startTime);
// 	},
// 	null,
// 	true,
// 	'Etc/UTC'
// );

// runSiloDataTracker.start();

// (async () => {
// 	backfillEventUsdValues()
// })();