if (require('dotenv').config().error) {
    console.error('Failed to load .env file');
}

const express = require('express');
const app = express();

const port = process.env.PORT_NUMBER;

app.get('/', (req, res) => res.send('Hello, World!'));

app.listen(port, () => console.log(`Listening on port ${port}`));