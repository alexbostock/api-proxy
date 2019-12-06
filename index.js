if (require('dotenv').config().error) {
    console.error('Failed to load .env file');
}

const express = require('express');
const app = express();

const axios = require('axios');

const port = process.env.PORT_NUMBER;
if (process.env.BEHIND_REVERSE_PROXY) {
    app.set('trust proxy', true);
}

app.get('/', (req, res) => {
    axios.get('https://api.rtt.io/api/v1/json/search/CBG', {
        auth: {
            username: process.env.RTT_USERNAME,
            password: process.env.RTT_PASSWORD,
        },
    })
        .then((api_res) => {
            console.log(api_res.status);
            res.send(api_res.data);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Failed to fetch from Realtime Trains API');
        });
});

app.listen(port, () => console.log(`Listening on port ${port}`));