const express = require('express');
const router = express.Router();

const axios = require('axios');

router.get('/latest', (req, res) => fetchLatest(req, res));

function fetchLatest(req, res) {
    res.set('Access-Control-Allow-Origin', process.env.CORS_HEADER);

    const url = 'https://xkcd.com/info.0.json';

    axios.get(url)
        .then((api_res) => {
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
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Failed to fetch from XKCD API');
        });
}

module.exports = router;