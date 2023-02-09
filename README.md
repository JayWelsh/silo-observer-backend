<br/>
<p align="center">
<img src="https://vagabond-public-storage.s3.eu-west-2.amazonaws.com/silo-observer-transparent-compressed.png" width="350" alt="silo.observer logo">
</p>

[backend](https://github.com/JayWelsh/silo-observer-backend) | [frontend](https://github.com/JayWelsh/silo-observer-frontend)
# silo.observer

### A community-lead effort to put together useful metrics & analytics for [silo.finance](https://silo.finance)

This project seeks to collect, cache, monitor & visualize data specifically for the silo.finance project, along with providing a [Discord Bot](https://discord.com/oauth2/authorize?client_id=1050077431454777447&scope=bot) to interface with the underlying silo.observer API (silo.observer is not officially associated with silo.finance).

This project is in early stages, currently, the following functionality has been built out:

- A [Discord Bot](https://discord.com/oauth2/authorize?client_id=1050077431454777447&scope=bot) which lets user's query basic data (e.g. rates, from the silo.finance subgraph, via Discord)
- Caching the full list of silos & assets within silo.finance
- Caching a 24-hour period of minutely data for rates of each asset within each silo

## API

All times are reported in UTC

The base URL for the silo.observer api is `https://api.silo.observer/`, only `GET` requests are supported for the foreseeable future, the endpoints which are currently available are described below.

### Pagination

All endpoints which are responsible for returning many records can be paginated by appending `page` & `perPage` query parameters onto the ends of the query URL (`page` defaults to `1` if it is left out).

Using `page` & `perPage` to fetch a 10 record (10 minute) page of the latest borrower rate data for the BAL silo ([example](https://api.silo.observer/rates/asset/BAL?page=1&perPage=10)):

```
https://api.silo.observer/rates/asset/BAL?page=1&perPage=10
```

Using `page` & `perPage` to move to the 2nd page of 10 records ([example](https://api.silo.observer/rates/asset/BAL?page=2&perPage=10)):

```
https://api.silo.observer/rates/asset/BAL?page=2&perPage=10
```

### Rates

Rate data is currently recorded on a minutely basis and only the last 24 hours of data is kept in a minutely resolution. This will soon be adjusted to also keep hourly records for historical purposes.

Fetch rates by asset, without specifying lending/borrowing ([example](https://api.silo.observer/rates/asset/BAL)):

```
https://api.silo.observer/rates/asset/{asset-address-or-symbol}
```

Fetching rates by asset, with specifying lending/borrowing ([example](https://api.silo.observer/rates/asset/BAL/borrower)):

```
https://api.silo.observer/rates/asset/{asset-address-or-symbol}/{lender|borrower}
```

Fetching rates by silo, includes rates on both sides (lending & borrowing) for each asset in the silo ([example](https://api.silo.observer/rates/silo/BAL)):

```
https://api.silo.observer/rates/silo/{silo-address-or-name}
```

## Roadmap

- Alerts via the [Discord Bot](https://discord.com/oauth2/authorize?client_id=1050077431454777447&scope=bot) for significant changes in rates/tvl/deposits/withdrawals/asset utilization and novel events such as liquidations
- Caching of a richer set of historical data beyond rates (tvl/deposits/withdrawals/asset utilization)
- Longer-term historical data storage on an hourly timescale (rates/tvl/deposits/withdrawals/asset utilization)

## Code pointers

"Cached" data is stored within a Postgres database, the process which runs each minute can be found [here](https://github.com/JayWelsh/silo-observer-backend/blob/main/src/tasks/periodic-silo-data-tracker.ts).

Discord Bot internal logic (commands & events) can be found [here](https://github.com/JayWelsh/silo-observer-backend/tree/main/src/discord-bot).

## Contributions/Requests

Feel free to fork this repo, contributions are welcomed via PRs. Alternatively, if you have any feature requests, feel free to share them via [Discord](https://discord.gg/txcZWpmrj7).

## Self-hosting

If you would like to self-host this application (locally or in a remote environment), the following .env variables are required:

```
# POSTGRES DB

DB_HOST="YOUR_DB_IP_ADDRESS"
DB_PORT="YOUR_PORT"
DB_NAME="YOUR_DB_NAME"
DB_USER="YOUR_DB_USER_NAME"
DB_PASS="YOUR_DB_PASSWORD"

# DISCORD

DISCORD_BOT_TOKEN="YOUR_DISCORD_BOT_SECRET_TOKEN"
DISCORD_BOT_CLIENT_ID="YOUR_DISCORD_BOT_CLIENT_ID"

# Alchemy
ALCHEMY_API_KEY="YOUR_ALCHEMY_API_KEY"
ALCHEMY_API_KEY_ARBITRUM="YOUR_ALCHEMY_API_KEY_ARBITRUM"
```

If Postgres is running on the same machine as this repo, then usually you would set the `DB_HOST` to `127.0.0.1`, the default Postgres `DB_PORT` is `5432`.