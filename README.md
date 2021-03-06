# api-proxy

A proxy to hide API keys, memoise responses and enforce rate limits.

## Usage

`npm install`

Create a `.env` file in the project root directory. `.env` should define:

- `PORT_NUMBER`: integer port number at which the server should listen.
- `BEHIND_REVERSE_PROXY`: a boolean value (1 or 0) indicating the deployment config.
- `CORS_ORIGINS`: valid origins for `Access-Control-Allow-Origin` header in responses. See CORS section below.
- `RTT_USERNAME`: a username for the [Realtime Trains](https://www.realtimetrains.co.uk/) API.
- `RTT_PASSWORD`: the corresponding password for the Realtime Trains API.

`npm run`

This proxy does not provide any rate-limiting. It should thus be deployed behind a reverse proxy such as NGINX, and `BEHIND_REVERSE_PROXY` in `.env` should be set to `1` (`true`).

## API

### Realtime Train Times

Realtime information about Great British trains, from [Realtime Trains](https://www.realtimetrains.co.uk/).

`GET /trains/<station>/departures`

`POST /trains/<station>/arrivals`

`<station>` should be a station's [CRS code](https://www.nationalrail.co.uk/stations_destinations/48541.aspx).

Returns status 404 if the requested station does not exist.

### Latest XKCD Comic

Returns data about the latest [xkcd](https://xkcd.com) comic.

`GET /xkcd/latest`

## Memoisation

Calls to third-party APIs are cached. Each endpoint has a TTL. Repeated requests to the same endpoint return a cached value. When the cached value is older than TTL, the next request to that endpoint will trigger a new call to the third-party API.

## CORS

All API responses will have a CORS header, depending on the environment variable `CORS_ORIGINS`

If `CORS_ORIGINS` is `*`, all response headers have `Access-Control-Allow-Origin: *`.

If `CORS_ORIGINS` is a comma-separated list (eg. `alexbostock.co.uk,bostock.uk`), the response to a request from any origin in that list will have `Access-Control-Allow-Origin: [Origin]` and `Vary: Origin`.