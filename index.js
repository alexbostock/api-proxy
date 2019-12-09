if (require('dotenv').config().error) {
    console.error('Failed to load .env file');
}

const express = require('express');
const app = express();

const port = process.env.PORT_NUMBER;
if (process.env.BEHIND_REVERSE_PROXY) {
    app.set('trust proxy', true);
}

const trains = require('./trains');
const xkcd = require('./xkcd');

app.get('/', (req, res) => {
    res.send('Hello!');
});

app.use('/trains', trains);

app.use('/xkcd', xkcd);

app.listen(port, () => console.log(`Listening on port ${port}`));