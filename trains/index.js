const fs = require('fs');

const express = require('express');
const router = express.Router();

const axios = require('axios');
const csvParse = require('csv-parse')
const Cache = require('../cache');

const ttl = 10 * 1000;
const cache = new Cache(ttl);

router.get('/:station/departures', (req, res) => fetchRTT(req, res));
router.get('/:station/arrivals', (req, res) => fetchRTT(req, res, true));
router.get('/stations', fetchStationList);

const username = process.env.RTT_USERNAME;
const password = process.env.RTT_PASSWORD;

let STATION_LIST = null;

async function loadStationList() {
    const csvData = fs.readFileSync('./trains/stations.csv');
    csvParse(csvData, (err, parsed) => {
        if (err) {
            throw new Error('Failed to parse csv st)ation list');
        } else {
            parsed.shift();
            STATION_LIST = parsed.map(([name, crs]) => ({
                crs: crs,
                name: name
            }));
        }
    });
}

loadStationList();

async function fetchStationList(req, res) {
    if (!STATION_LIST) {
        res.status(500).send('Failed to read / parse station list');
        return;
    }
    res.send(STATION_LIST);
}

async function fetchRTT(req, res, arrivals) {
    const station = req.params['station'];
    if (!station) {
        res.status(400).send('Expected station CRS');
    }

    const baseUrl = 'https://api.rtt.io/api/v1/json/search/' + station;
    const url = arrivals ? baseUrl + '/arrivals' : baseUrl;

    try {
        const apiRes = await getData(url);

        switch(apiRes.status) {
        case 200:
            res.send(trimData(apiRes.data, arrivals));
            break;
        case 404:
            res.status(404).send('Station not found');
            break;
        case 500:
            res.status(500).send('RTT API gave error 500');
            break;
        case 429:
            res.status(429).send('Rate limit exceeded');
            break;
        default:
            res.status(500).send('Unexpected error from RTT API: ' + apiRes.status);
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Failed to fetch from Realtime Trains API');
    }
}

async function getData(url, ttl) {
    cache.set(url, cache.get(url) || axios.get(url, {
        auth: {username: username, password: password}
    }), ttl);
    return cache.get(url);
}

function trimData(apiRes, arrivals) {
    return {
        location: apiRes.location.name,

        services: (apiRes['services'] || [])
            .filter((service) => service.isPassenger && service.locationDetail.isPublicCall)
            .map((service) => {
                const details = service.locationDetail;

                const arrived = details.realtimeArrivalActual === undefined ?
                    true : details.realtimeArrivalActual;
                const scheduledTime = arrivals ? details.gbttBookedArrival : details.gbttBookedDeparture;
                const realTime = arrivals ? details.realtimeArrival : details.realtimeDeparture;
                
                return {
                    // Where a service has multiple destinations, return the latest one only.
                    destination: details.destination.reduce((acc, dest) => {
                        return dest.workingTime > acc.workingTime ? dest : acc;
                    }).description,

                    arrived: arrived,
                    scheduledTime: parseInt(scheduledTime),
                    realTime: parseInt(realTime),
                    platform: details.platform,
                    operator: service.atocName,
                }
            }),
    };
}

module.exports = router;
