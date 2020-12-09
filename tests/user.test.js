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
const { createUser, clearAll } = require('./testHelpers');

let admin = {
	name: 'Test Admin',
	email: 'admin@mail.com',
	password: '123456Admin',
	userType: 'admin',
};
let realtor = {
	name: 'Test Realtor',
	email: 'realtor@mail.com',
	password: '123456Realtor',
	userType: 'realtor',
};
let client = {
	name: 'Test Client',
	email: 'client@mail.com',
	password: '123456Client',
	userType: 'client',
};
let testClient = {
	name: 'Test Client User',
	email: 'testclient@mail.com',
	password: '123456Test',
	userType: 'client',
};
let testRealtor = {
	name: 'Test Realtor User',
	email: 'testrealtor@mail.com',
	password: '123456Test',
	userType: 'realtor',
};

describe('User Tests', () => {
	before(async () => {
		admin.id = await createUser(admin);
		realtor.id = await createUser(realtor);
		client.id = await createUser(client);
	});
	context('GET /api/users/email/:email', () => {
		it('Should return true if email already exists', (done) => {
			request(app)
				.get('/api/users/email/admin@mail.com')
				.expect(200)
				.end((err, response) => {
					expect(response.body)
						.to.have.property('emailExists')
						.to.equal(true);
					done(err);
				});
		});
		it('Should return false if email does not exists', (done) => {
			request(app)
				.get('/api/users/email/anotheradmin@mail.com')
				.expect(404)
				.end((err, response) => {
					expect(response.body)
						.to.have.property('emailExists')
						.to.equal(false);
					done(err);
				});
		});
		it('Should return true if email already exists but with different case', (done) => {
			request(app)
				.get('/api/users/email/ADMIN@mail.com')
				.expect(200)
				.end((err, response) => {
					expect(response.body)
						.to.have.property('emailExists')
						.to.equal(true);
					done(err);
				});
		});
	});
	context('GET /api/users', () => {
		let token;
		let userId;
		it('Should not return a user if no one signed in', (done) => {
			let token;
			request(app)
				.get('/api/users')
				.expect(401)
				.end((err, response) => {
					expect(response.body)
						.to.have.property('success')
						.to.equal(false);
					done(err);
				});
		});
		it('should sign in new created admin', (done) => {
			request(app)
				.post('/api/auth/signin')
				.send({
					email: 'admin@mail.com',
					password: '123456Admin',
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
		it('Should return all users if admin is logged in', (done) => {
			request(app)
				.get('/api/users')
				.set('Cookie', token)
				.expect(200)
				.end((err, response) => {
					expect(response.body)
						.to.have.property('success')
						.to.equal(true);
					done(err);
				});
		});
		it('Should return all clients if admin is logged in and search for client', (done) => {
			request(app)
				.get('/api/users?userType=client')
				.set('Cookie', token)
				.expect(200)
				.end((err, response) => {
					expect(response.body)
						.to.have.property('success')
						.to.equal(true);
					done(err);
				});
		});
		it('Should return all realtors if admin is logged in and search for realtors', (done) => {
			request(app)
				.get('/api/users?userType=realtor')
				.set('Cookie', token)
				.expect(200)
				.end((err, response) => {
					expect(response.body)
						.to.have.property('success')
						.to.equal(true);
					done(err);
				});
		});
		it('Should not return any user if admin is logged in and search for admin', (done) => {
			request(app)
				.get('/api/users?userType=admin')
				.set('Cookie', token)
				.expect(400)
				.end((err, response) => {
					expect(response.body)
						.to.have.property('success')
						.to.equal(false);
					done(err);
				});
		});
		it('should sign in new created realtor', (done) => {
			request(app)
				.post('/api/auth/signin')
				.send({
					email: 'realtor@mail.com',
					password: '123456Realtor',
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
		it('Should return authorization error if realtor is logged in', (done) => {
			request(app)
				.get('/api/users')
				.set('Cookie', token)
				.expect(401)
				.end((err, response) => {
					expect(response.body)
						.to.have.property('success')
						.to.equal(false);
					done(err);
				});
		});
		it('should sign in new created client', (done) => {
			request(app)
				.post('/api/auth/signin')
				.send({
					email: 'client@mail.com',
					password: '123456Client',
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
		it('Should return authorization error if client is logged in', (done) => {
			request(app)
				.get('/api/users')
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
	context('GET /api/users/:userId', () => {
		it('Should not return a user if no one signed in', (done) => {
			request(app)
				.get('/api/users/' + admin.id)
				.expect(401)
				.end((err, response) => {
					expect(response.body)
						.to.have.property('success')
						.to.equal(false);
					done(err);
				});
		});
		it('should sign in new created admin', (done) => {
			request(app)
				.post('/api/auth/signin')
				.send({
					email: 'admin@mail.com',
					password: '123456Admin',
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
		it('Should not return user if user id is invalid', (done) => {
			request(app)
				.get('/api/users/123')
				.set('Cookie', token)
				.expect(404)
				.end((err, response) => {
					expect(response.body)
						.to.have.property('success')
						.to.equal(false);
					done(err);
				});
		});
		it('Should return a realtor if admin is logged in', (done) => {
			request(app)
				.get('/api/users/' + realtor.id)
				.set('Cookie', token)
				.expect(200)
				.end((err, response) => {
					expect(response.body)
						.to.have.property('success')
						.to.equal(true);
					done(err);
				});
		});
		it('Should return a client if admin is logged in', (done) => {
			request(app)
				.get('/api/users/' + client.id)
				.set('Cookie', token)
				.expect(200)
				.end((err, response) => {
					expect(response.body)
						.to.have.property('success')
						.to.equal(true);
					done(err);
				});
		});
		it('Should return personal profile if admin is logged in', (done) => {
			request(app)
				.get('/api/users/' + admin.id)
				.set('Cookie', token)
				.expect(200)
				.end((err, response) => {
					expect(response.body)
						.to.have.property('success')
						.to.equal(true);
					done(err);
				});
		});
		it('should sign in new created realtor', (done) => {
			request(app)
				.post('/api/auth/signin')
				.send({
					email: 'realtor@mail.com',
					password: '123456Realtor',
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
		it('Should return personal profile if realtor is logged in', (done) => {
			request(app)
				.get('/api/users/' + realtor.id)
				.set('Cookie', token)
				.expect(200)
				.end((err, response) => {
					expect(response.body)
						.to.have.property('success')
						.to.equal(true);
					done(err);
				});
		});
		it('Should not return other user if realtor is signed in', (done) => {
			request(app)
				.get('/api/users/' + client.id)
				.set('Cookie', token)
				.expect(401)
				.end((err, response) => {
					expect(response.body)
						.to.have.property('success')
						.to.equal(false);
					done(err);
				});
		});
		it('should sign in new created client', (done) => {
			request(app)
				.post('/api/auth/signin')
				.send({
					email: 'client@mail.com',
					password: '123456Client',
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
		it('Should return personal profile if client is logged in', (done) => {
			request(app)
				.get('/api/users/' + client.id)
				.set('Cookie', token)
				.expect(200)
				.end((err, response) => {
					expect(response.body)
						.to.have.property('success')
						.to.equal(true);
					done(err);
				});
		});
		it('Should not return other uer if client is signed in', (done) => {
			request(app)
				.get('/api/users/' + realtor.id)
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
	context('POST /api/users', () => {
		it('Should not create user if no user is logged in', (done) => {
			request(app)
				.post('/api/users/')
				.send(testClient)
				.expect(401)
				.end((err, response) => {
					expect(response.body)
						.to.have.property('success')
						.to.equal(false);
					done(err);
				});
		});
		it('should sign in new created admin', (done) => {
			request(app)
				.post('/api/auth/signin')
				.send({
					email: 'admin@mail.com',
					password: '123456Admin',
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
		it('Should create user if admin is logged in', (done) => {
			request(app)
				.post('/api/users/')
				.send(testClient)
				.set('Cookie', token)
				.expect(200)
				.end((err, response) => {
					expect(response.body)
						.to.have.property('success')
						.to.equal(true);
					done(err);
				});
		});
		it('should sign in new created realtor', (done) => {
			request(app)
				.post('/api/auth/signin')
				.send({
					email: 'realtor@mail.com',
					password: '123456Realtor',
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
		it('Should not create user if realtor is logged in', (done) => {
			request(app)
				.post('/api/users/')
				.send(testRealtor)
				.set('Cookie', token)
				.expect(401)
				.end((err, response) => {
					expect(response.body)
						.to.have.property('success')
						.to.equal(false);
					done(err);
				});
		});
		it('should sign in new created client', (done) => {
			request(app)
				.post('/api/auth/signin')
				.send({
					email: 'client@mail.com',
					password: '123456Client',
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
		it('Should not create user if client is logged in', (done) => {
			request(app)
				.post('/api/users/')
				.send(testRealtor)
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
	context('PUT /api/users/:userId', () => {
		it('Should not update user if no user is logged in', (done) => {
			request(app)
				.put('/api/users/' + testClient.id)
				.send({ ...testClient, name: 'changed name' })
				.expect(401)
				.end((err, response) => {
					expect(response.body)
						.to.have.property('success')
						.to.equal(false);
					done(err);
				});
		});
		it('should sign in new created admin', (done) => {
			request(app)
				.post('/api/auth/signin')
				.send({
					email: 'admin@mail.com',
					password: '123456Admin',
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
		it('Should update user if admin is logged in', (done) => {
			request(app)
				.put('/api/users/' + client.id)
				.send({ ...client, name: 'changed name' })
				.set('Cookie', token)
				.expect(200)
				.end((err, response) => {
					expect(response.body)
						.to.have.property('success')
						.to.equal(true);
					done(err);
				});
		});
		it('should sign in new created realtor', (done) => {
			request(app)
				.post('/api/auth/signin')
				.send({
					email: 'realtor@mail.com',
					password: '123456Realtor',
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
		it('Should not update user if realtor is logged in', (done) => {
			request(app)
				.put('/api/users/' + client.id)
				.send({ ...client, name: 'changed name' })
				.set('Cookie', token)
				.expect(401)
				.end((err, response) => {
					expect(response.body)
						.to.have.property('success')
						.to.equal(false);
					done(err);
				});
		});
		it('should sign in new created client', (done) => {
			request(app)
				.post('/api/auth/signin')
				.send({
					email: 'client@mail.com',
					password: '123456Client',
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
		it('Should not update user if client is logged in', (done) => {
			request(app)
				.put('/api/users/' + realtor.id)
				.send({ ...realtor, name: 'changed name' })
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
	context('DELETE /api/users/:userId', () => {
		it('Should not delete user if no user is logged in', (done) => {
			request(app)
				.delete('/api/users/' + testClient.id)
				.expect(401)
				.end((err, response) => {
					expect(response.body)
						.to.have.property('success')
						.to.equal(false);
					done(err);
				});
		});
		it('should sign in new created client', (done) => {
			request(app)
				.post('/api/auth/signin')
				.send({
					email: 'client@mail.com',
					password: '123456Client',
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
		it('Should not delete user if client is logged in', (done) => {
			request(app)
				.delete('/api/users/' + realtor.id)
				.set('Cookie', token)
				.expect(401)
				.end((err, response) => {
					expect(response.body)
						.to.have.property('success')
						.to.equal(false);
					done(err);
				});
		});
		it('should sign in new realtor client', (done) => {
			request(app)
				.post('/api/auth/signin')
				.send({
					email: 'realtor@mail.com',
					password: '123456Realtor',
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
		it('Should not delete user if realtor is logged in', (done) => {
			request(app)
				.delete('/api/users/' + client.id)
				.set('Cookie', token)
				.expect(401)
				.end((err, response) => {
					expect(response.body)
						.to.have.property('success')
						.to.equal(false);
					done(err);
				});
		});
		it('should sign in new created admin', (done) => {
			request(app)
				.post('/api/auth/signin')
				.send({
					email: 'admin@mail.com',
					password: '123456Admin',
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
		it('Should delete user if admin is logged in', (done) => {
			request(app)
				.delete('/api/users/' + client.id)
				.set('Cookie', token)
				.expect(200)
				.end((err, response) => {
					expect(response.body)
						.to.have.property('success')
						.to.equal(true);
					done(err);
				});
		});
		it('Should not delete admin himself', (done) => {
			request(app)
				.delete('/api/users/' + admin.id)
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
	after(() => {
		clearAll();
	});
});
