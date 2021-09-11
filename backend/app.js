const express = require('express');
const app = express();

app.get('*', (req, res) => res.send('The frontend will be here one day'));

app.listen(5000, () => console.log('Started the server'));
