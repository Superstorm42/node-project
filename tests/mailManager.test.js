const chai = require('chai');
const expect = chai.expect;
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
chai.use(sinonChai);
const rewire = require('rewire');
const request = require('supertest');
const mockery = require('mockery');
var app = rewire('../app');
var sandbox = sinon.createSandbox();
const { clearAll } = require('./testHelpers');
const nodemailerMock = require('nodemailer-mock');

const { sendMailToUser } = require('../utils/emailManager');
let admin = {
	name: 'Test Admin',
	email: 'testadmin@mail.com',
	password: '123456Admin',
	userType: 'admin',
};
describe('Mail Tests', () => {
	let app = null;
	before(async () => {
		// Enable mockery to mock objects
		mockery.enable({
			warnOnUnregistered: false,
		});
		mockery.registerMock('nodemailer', nodemailerMock);
	});
	afterEach(async () => {
		// Reset the mock back to the defaults after each test
		nodemailerMock.mock.reset();
	});
	after(async () => {
		// Remove our mocked nodemailer and disable mockery
		mockery.deregisterAll();
		mockery.disable();
	});
	it('should send an email using nodemailer-mock', () => {
		const response = sendMailToUser(
			admin.email,
			'Test subject',
			'Test Body'
		);

		setTimeout(function () {
			const sentMail = nodemailerMock.mock.getSentMail();
			expect(sentMail).to.have.length(1);
		}, 20000);
	});
	it('should not send an email using nodemailer-mock if email is invalid', () => {
		const response = sendMailToUser('admin', 'Test subject', 'Test Body');
		setTimeout(function () {
			const sentMail = nodemailerMock.mock.getSentMail();
			expect(sentMail).to.have.length(0);
		}, 20000);
	});
});
