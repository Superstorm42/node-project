const test = require('express').Router();

test.get('/', (req, res) => {
	res.status(200).send({ value: req.query.option });
});
test.get('/', (req, res) => {
	res.status(200).send({ value: req.query.option });
});
test.post('/', (req, res) => {
	res.status(200).send({ value: req.body.option });
});

module.exports = test;
