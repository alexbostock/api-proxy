const express = require('express');
const router = express.Router();

const axios = require('axios');

router.get('/:station/departures', (req, res) => fetchRTT(req, res));
router.get('/:station/arrivals', (req, res) => fetchRTT(req, res, true));

const username = process.env.RTT_USERNAME;
const password = process.env.RTT_PASSWORD;

function fetchRTT(req, res, arrivals) {
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
                res.send(api_res.data);
            case 404:
                res.status(400).send("Station not found");
            case 500:
                res.status(500).send("RTT API gave error 500");
            case 429:
                res.status(429).send("Rate limit exceeded");
            default:
                res.status(500).send("Unexpected error from RTT API: " + api_res.status);
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Failed to fetch from Realtime Trains API');
        });
}

module.exports = router;