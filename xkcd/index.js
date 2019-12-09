const express = require('express');
const router = express.Router();

const axios = require('axios');
const Cache = require('../cache');

const ttl = 5 * 60 * 1000;
const cache = new Cache(ttl);

router.get('/latest', fetchLatest);

async function fetchLatest(req, res) {
    res.set('Access-Control-Allow-Origin', process.env.CORS_HEADER);

    try {
        const api_res = await getData();

        switch(api_res.status) {
        case 200:
            res.send(api_res.data);
            break;
        case 500:
            res.status(500).send("XKCD API gave error 500");
            break;
        case 429:
            res.status(429).send("Rate limit exceeded");
            break;
        default:
            res.status(500).send("Unexpected error from XKCD API: " + api_res.status);
        }
    } catch(err) {
        console.error(err);
        res.status(500).send('Failed to fetch from XKCD API');
    };
}

async function getData() {
    const url = 'https://xkcd.com/info.0.json';

    cache.set(url, cache.get(url) || axios.get(url));
    return cache.get(url);
}

module.exports = router;