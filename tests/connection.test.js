const chai = require('chai');
const expect = chai.expect;
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
chai.use(sinonChai);
const rewire = require('rewire');
const request = require('supertest');

var app = rewire('../app');
var sandbox = sinon.createSandbox();
const { clearAll } = require('./testHelpers');

describe('Connection Tests', () => {
	context('POST /api', () => {
		it('should connect to API', (done) => {
			request(app)
				.get('/api')
				.expect(200)
				.end((err, response) => {
					expect(response.body)
						.to.have.property('success')
						.to.equal(true);
					done(err);
				});
		});
	});
});
