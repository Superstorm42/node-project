const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const path = require('path');
const config = require('./config/config').get(process.env.NODE_ENV);
const app = express();
const routes = require('./routes');

mongoose.Promise = global.Promise;
if (mongoose.connection.readyState == 0) {
	mongoose.connect(config.DATABASE, {
		useCreateIndex: true,
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});
	mongoose.set('useFindAndModify', false);
}

app.use(
	bodyParser.urlencoded({
		extended: true,
	})
);

app.use(bodyParser.json({ limit: '100mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));
app.use(cookieParser());

app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*');
	res.header(
		'Access-Control-Allow-Headers',
		'Origin, X-Requested-With, Content-Type, Accept'
	);
	next();
});

//connect all routes to the application
app.use('/api', routes);
app.use(express.static(path.join(__dirname, 'build')));

app.get('/*', function (req, res) {
	res.cookie().sendFile(path.join(__dirname, 'build', 'index.html'));
});
module.exports = app;
