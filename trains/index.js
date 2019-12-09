const express = require('express');
const router = express.Router();

const axios = require('axios');

router.get('/:station/departures', (req, res) => fetchRTT(req, res));
router.get('/:station/arrivals', (req, res) => fetchRTT(req, res, true));

const username = process.env.RTT_USERNAME;
const password = process.env.RTT_PASSWORD;

function fetchRTT(req, res, arrivals) {
    res.set('Access-Control-Allow-Origin', process.env.CORS_HEADER);

    const station = req.params['station'];
    if (!station) {
        res.status(400).send("Expected station CRS");
    }

    const baseUrl = 'https://api.rtt.io/api/v1/json/search/' + station;
    const url = arrivals ? baseUrl + '/arrivals' : baseUrl;

    axios.get(url, {auth: {username: username, password: password}})
        .then((api_res) => {
            switch(api_res.status) {
            case 200:
                res.send(trimData(api_res.data, arrivals));
                break;
            case 404:
                res.status(404).send("Station not found");
                break;
            case 500:
                res.status(500).send("RTT API gave error 500");
                break;
            case 429:
                res.status(429).send("Rate limit exceeded");
                break;
            default:
                res.status(500).send("Unexpected error from RTT API: " + api_res.status);
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Failed to fetch from Realtime Trains API');
        });
}

function trimData(api_res, arrivals) {
    return {
        location: api_res.location.name,

        services: api_res['services']
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