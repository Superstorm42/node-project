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
const { clearAll, createUser } = require('./testHelpers');
let admin = {
	name: 'Test Admin',
	email: 'admin@mail.com',
	password: '123456Admin',
	userType: 'admin',
};
describe('Auth Tests', () => {
	const adminEmail = 'admin@mail.com';
	context('POST /api/auth/signup', () => {
		it('should not seed a new admin when try to seed with invalid email', (done) => {
			request(app)
				.post('/api/auth/seed')
				.send({ email: 'admin' })
				.expect(400)
				.end((err, response) => {
					expect(response.body)
						.to.have.property('success')
						.to.equal(false);
					done(err);
				});
		});
		it('should seed a new admin when there is no user in db', (done) => {
			request(app)
				.post('/api/auth/seed')
				.send({ email: adminEmail })
				.expect(200)
				.end((err, response) => {
					expect(response.body)
						.to.have.property('success')
						.to.equal(true);
					done(err);
				});
		});
		it('should not seed a new admin when there is user in db', (done) => {
			request(app)
				.post('/api/auth/seed')
				.send({ email: adminEmail })
				.expect(400)
				.end((err, response) => {
					expect(response.body)
						.to.have.property('success')
						.to.equal(false);
					done(err);
				});
		});
	});
	let token;
	let userId;
	context('POST /api/auth/signup', () => {
		it('should sign up a new user', (done) => {
			request(app)
				.post('/api/auth/signup')
				.send({
					name: 'Test client',
					email: 'client@mail.com',
					password: '123456',
					userType: 'client',
				})
				.expect(200)
				.end((err, response) => {
					expect(response.body)
						.to.have.property('success')
						.to.equal(true);
					done(err);
				});
		});
		it('should not sign up if no name given', (done) => {
			request(app)
				.post('/api/auth/signup')
				.send({
					email: 'noName@mail.com',
					password: '123456',
					userType: 'client',
				})
				.expect(400)
				.end((err, response) => {
					expect(response.body)
						.to.have.property('success')
						.to.equal(false);
					done(err);
				});
		});
		it('should not sign up if no email given', (done) => {
			request(app)
				.post('/api/auth/signup')
				.send({
					name: 'Test user',
					password: '123456',
					userType: 'client',
				})
				.expect(400)
				.end((err, response) => {
					expect(response.body)
						.to.have.property('success')
						.to.equal(false);
					done(err);
				});
		});
		it('should not sign up if no password given', (done) => {
			request(app)
				.post('/api/auth/signup')
				.send({
					name: 'Test user',
					email: 'test1@mail.com',
					userType: 'client',
				})
				.expect(400)
				.end((err, response) => {
					expect(response.body)
						.to.have.property('success')
						.to.equal(false);
					done(err);
				});
		});
		it('should not sign up if no user type given', (done) => {
			request(app)
				.post('/api/auth/signup')
				.send({
					name: 'Test user',
					email: 'test3@mail.com',
					password: '123456',
				})
				.expect(400)
				.end((err, response) => {
					expect(response.body)
						.to.have.property('success')
						.to.equal(false);
					done(err);
				});
		});
		it('should not sign up if duplicate email given', (done) => {
			request(app)
				.post('/api/auth/signup')
				.send({
					name: 'Test realtor',
					email: 'client@mail.com',
					password: '123456',
					userType: 'realtor',
				})
				.expect(401)
				.end((err, response) => {
					expect(response.body)
						.to.have.property('success')
						.to.equal(false);
					done(err);
				});
		});
		it('should not sign up if user type is admin', (done) => {
			request(app)
				.post('/api/auth/signup')
				.send({
					name: 'Test admin',
					email: 'admin@mail.com',
					password: '123456',
					userType: 'admin',
				})
				.expect(400)
				.end((err, response) => {
					expect(response.body)
						.to.have.property('success')
						.to.equal(false);
					done(err);
				});
		});
	});
	context('POST /api/auth/signin', () => {
		it('should sign in new created user', (done) => {
			request(app)
				.post('/api/auth/signin')
				.send({
					email: 'client@mail.com',
					password: '123456',
				})
				.expect(200)
				.end((err, response) => {
					token = response.header['set-cookie'];
					userId = response.body.user._id;
					expect(response.body)
						.to.have.property('success')
						.to.equal(true);
					done(err);
				});
		});
		it('should not sign in if email is not found', (done) => {
			request(app)
				.post('/api/auth/signin')
				.send({
					email: 'noName@mail.com',
					password: '123456',
				})
				.expect(401)
				.end((err, response) => {
					expect(response.body)
						.to.have.property('success')
						.to.equal(false);
					done(err);
				});
		});
		it('should not sign in if password is wrong', (done) => {
			request(app)
				.post('/api/auth/signin')
				.send({
					email: 'client@mail.com',
					password: '123456a',
				})
				.expect(401)
				.end((err, response) => {
					expect(response.body)
						.to.have.property('success')
						.to.equal(false);
					done(err);
				});
		});
	});
	context('GET /api/auth', () => {
		it('should get authenticated if was signed in before', (done) => {
			request(app)
				.get('/api/auth')
				.set('Cookie', token)
				.expect(200)
				.end((err, response) => {
					expect(response.body)
						.to.have.property('isAuth')
						.to.equal(true);
					done(err);
				});
		});
	});
	context('PUT /api/auth/:userId/password', () => {
		it('should change user password', (done) => {
			request(app)
				.put('/api/auth/' + userId + '/password')
				.send({
					oldPassword: '123456',
					password: '123123',
					confirmPassword: '123123',
				})
				.set('Cookie', token)
				.expect(200)
				.end((err, response) => {
					expect(response.body)
						.to.have.property('success')
						.to.equal(true);
					expect(response.body)
						.to.have.property('message')
						.to.equal('Password changed successfully.');
					done(err);
				});
		});
		it('should not change user password if old password is wrong', (done) => {
			request(app)
				.put('/api/auth/' + userId + '/password')
				.send({
					oldPassword: '123456',
					password: '123123',
					confirmPassword: '123123',
				})
				.set('Cookie', token)
				.expect(401)
				.end((err, response) => {
					expect(response.body)
						.to.have.property('success')
						.to.equal(false);
					expect(response.body)
						.to.have.property('message')
						.to.equal('Invalid old password');
					done(err);
				});
		});
		it('should not change user password if user is not himself', (done) => {
			request(app)
				.put('/api/auth/123456789123456789123456/password')
				.send({
					oldPassword: '123456',
					password: '123123',
					confirmPassword: '123123',
				})
				.set('Cookie', token)
				.expect(401)
				.end((err, response) => {
					expect(response.body)
						.to.have.property('success')
						.to.equal(false);
					done(err);
				});
		});
	});
	context('POST /api/auth/signout', () => {
		it('should get signout if was signed in before', (done) => {
			request(app)
				.post('/api/auth/signout')
				.set('Cookie', token)
				.expect(200)
				.end((err, response) => {
					expect(response.body)
						.to.have.property('isAuth')
						.to.equal(false);
					expect(response.body)
						.to.have.property('message')
						.to.equal('Signed out from the system');
					done(err);
				});
		});
	});
	context('POST /recover', () => {
		it('Should not send email if user is not found', (done) => {
			request(app)
				.post('/api/auth/recover')
				.send({ email: 'email@not.found' })
				.expect(404)
				.end((err, response) => {
					expect(response.body)
						.to.have.property('message')
						.to.equal(
							'The email address, email@not.found is not associated with any account. Double-check your email address and try again.'
						);
					done(err);
				});
		});
		it('Should send email if user is found', (done) => {
			request(app)
				.post('/api/auth/recover')
				.send({ email: admin.email })
				.expect(200)
				.end((err, response) => {
					expect(response.body)
						.to.have.property('message')
						.to.equal(
							'A reset email has been sent to ' +
								admin.email +
								'.'
						);
					done(err);
				});
		});
	});
	context('POST /:userId/reset/:token', () => {
		let testAdmin = {
			name: 'Test Admin',
			email: 'testadmin@mail.com',
			password: '123456Admin',
			userType: 'admin',
		};
		before(async () => {
			testAdmin.id = await createUser(testAdmin);
		});
		it('Should not reset password if token is invalid', (done) => {
			request(app)
				.post('/api/auth/' + testAdmin.id + '/reset/12345')
				.send({ password: '123456', confirmPassword: '123456' })
				.expect(401)
				.end((err, response) => {
					expect(response.body)
						.to.have.property('message')
						.to.equal(
							'Password reset token is invalid or has expired.'
						);
					done(err);
				});
		});
	});
	after(() => {
		clearAll();
	});
});
