var express = require('express');
var bodyParser = require('body-parser');

var app = express();

app.use(bodyParser.json());

app.get('/ping', function (req, res) {
	res.send('pong');
});

module.exports = app;