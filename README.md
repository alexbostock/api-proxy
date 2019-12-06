# api-proxy

A proxy to hide API keys, memoise responses and enforce rate limits.

## Usage

`npm install`

Create a `.env` file in the project root directory. `.env` should define:

- `PORT_NUMBER`: integer port number at which the server should listen.
- `BEHIND_REVERSE_PROXY`: a boolean value (1 or 0) indicating the deployment config.
- `RTT_USERNAME`: a username for the [Realtime Trains](https://www.realtimetrains.co.uk/) API.
- `RTT_PASSWORD`: the corresponding password for the Realtime Trains API.

`npm run`

## API

### Realtime Train Times

Realtime information about Great British trains, from [Realtime Trains](https://www.realtimetrains.co.uk/).

`GET /trains/<station>/departures`

`POST /trains/<station>/arrivals`

`<station>` should be a station's [CRS code](https://www.nationalrail.co.uk/stations_destinations/48541.aspx).

Returns status 404 if the requested station does not exist.

## TODO

- [ ] Add a rate-limiter.
- [ ] Memoise responses to minimise the number of calls to third-party APIs.
- [ ] Add endpoints to fetch only details of trains departing for or arriving from a particular station.
- Add additional API endpoints.