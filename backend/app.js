const express = require('express');
const bodyParser = require('body-parser');
const api = require('./api');
const app = express();

app.use(bodyParser.json());
app.use('/api', api);
app.use('*', express.static(__dirname + '/dist'));

app.listen(5000, () => console.log('Started the server'));
