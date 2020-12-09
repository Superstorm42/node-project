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
const { createUser, clearAll, createApartment } = require('./testHelpers');
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
let apartment1 = {
	name: 'apartment 1',
	description: 'Lorem Ipsum text',
	floorAreaSize: 10,
	pricePerMonth: 100,
	numberOfRooms: 5,
	latitude: 10,
	longitude: 100,
	isAvailable: true,
};
let apartment2 = {
	name: 'apartment 2',
	description: 'Lorem Ipsum text again',
	floorAreaSize: 100,
	pricePerMonth: 1000,
	numberOfRooms: 50,
	latitude: 45,
	longitude: 90,
	isAvailable: false,
};
let apartment3 = {
	name: 'apartment 3',
	description: 'Lorem Ipsum text again',
	floorAreaSize: 100,
	pricePerMonth: 1000,
	numberOfRooms: 50,
	latitude: 45,
	longitude: 90,
	isAvailable: true,
};
describe('Apartments Tests', () => {
	before(async () => {
		admin.id = await createUser(admin);
		realtor.id = await createUser(realtor);
		client.id = await createUser(client);
		apartment1.realtorId = realtor.id;
		apartment1.createdBy = realtor.id;
		apartment2.realtorId = admin.id;
		apartment2.createdBy = admin.id;
		apartment3.realtorId = realtor.id;
		apartment3.createdBy = realtor.id;
		apartment1.id = await createApartment(apartment1);
		apartment2.id = await createApartment(apartment2);
	});
	context('GET /api/apartments', () => {
		let token;
		let userId;
		it('Should not return apartment list if no one signed in', (done) => {
			let token;
			request(app)
				.get('/api/apartments')
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
		it('Should return all apartments if admin is logged in', (done) => {
			request(app)
				.get('/api/apartments')
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
		it('Should return all apartments if realtor is logged in', (done) => {
			request(app)
				.get('/api/apartments')
				.set('Cookie', token)
				.expect(200)
				.end((err, response) => {
					expect(response.body)
						.to.have.property('success')
						.to.equal(true);
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
		it('Should return all apartments if client is logged in', (done) => {
			request(app)
				.get('/api/apartments')
				.set('Cookie', token)
				.expect(200)
				.end((err, response) => {
					expect(response.body)
						.to.have.property('success')
						.to.equal(true);
					done(err);
				});
		});
		it('Should return all available apartments if client is logged in', (done) => {
			request(app)
				.get('/api/apartments')
				.set('Cookie', token)
				.expect(200)
				.end((err, response) => {
					expect(response.body)
						.to.have.property('success')
						.to.equal(true);
					const allApartments = response.body.apartments;
					for (let i = 0; i < allApartments.length; i++) {
						expect(allApartments[i])
							.to.have.property('isAvailable')
							.to.equal(true);
					}
					done(err);
				});
		});
	});
	context('GET /api/apartments/:apartmentId', () => {
		it('Should not return apartment if no one signed in', (done) => {
			let token;
			request(app)
				.get('/api/apartments/' + apartment1.id)
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
		it('Should return apartments if admin is logged in', (done) => {
			request(app)
				.get('/api/apartments/' + apartment1.id)
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
		it('Should return apartments if realtor is logged in', (done) => {
			request(app)
				.get('/api/apartments/' + apartment1.id)
				.set('Cookie', token)
				.expect(200)
				.end((err, response) => {
					expect(response.body)
						.to.have.property('success')
						.to.equal(true);
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
		it('Should return apartments if client is logged in', (done) => {
			request(app)
				.get('/api/apartments/' + apartment1.id)
				.set('Cookie', token)
				.expect(200)
				.end((err, response) => {
					expect(response.body)
						.to.have.property('success')
						.to.equal(true);
					done(err);
				});
		});
		it('Should return available apartments if client is logged in', (done) => {
			request(app)
				.get('/api/apartments/' + apartment2.id)
				.set('Cookie', token)
				.expect(401)
				.end((err, response) => {
					expect(response.body)
						.to.have.property('success')
						.to.equal(false);
					expect(response.body)
						.to.have.property('message')
						.to.equal('Apartment is not available');
					done(err);
				});
		});
	});
	context('POST /api/apartments', () => {
		it('Should not create apartment if no one signed in', (done) => {
			let token;
			request(app)
				.post('/api/apartments')
				.send(apartment3)
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
		it('Should create apartment if admin is logged in', (done) => {
			request(app)
				.post('/api/apartments')
				.send(apartment3)
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
		it('Should create apartments if realtor is logged in', (done) => {
			request(app)
				.post('/api/apartments')
				.send(apartment3)
				.set('Cookie', token)
				.expect(200)
				.end((err, response) => {
					expect(response.body)
						.to.have.property('success')
						.to.equal(true);
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
		it('Should not create apartment if client is logged in', (done) => {
			request(app)
				.post('/api/apartments')
				.send(apartment3)
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
	context('PUT /api/apartments/:apartmentId', () => {
		it('Should not update apartment if no one signed in', (done) => {
			let token;
			request(app)
				.put('/api/apartments/' + apartment2.id)
				.send({ ...apartment2, name: 'changed apartment name' })
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
		it('Should update apartment if admin is logged in', (done) => {
			request(app)
				.put('/api/apartments/' + apartment2.id)
				.send({ ...apartment2, name: 'changed name' })
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
		it('Should update apartments if realtor is logged in', (done) => {
			request(app)
				.put('/api/apartments/' + apartment1.id)
				.send({ ...apartment1, name: 'again changed apartment name' })
				.set('Cookie', token)
				.expect(200)
				.end((err, response) => {
					expect(response.body)
						.to.have.property('success')
						.to.equal(true);
					done(err);
				});
		});
		it('Should not update apartments if realtor is not same', (done) => {
			request(app)
				.put('/api/apartments/' + apartment2.id)
				.send({ ...apartment2, name: 'again changed apartment name' })
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
		it('Should not create apartment if client is logged in', (done) => {
			request(app)
				.put('/api/apartments/' + apartment2.id)
				.send({
					...apartment2,
					name: 'again changed apartment name by client',
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
	context('DELETE /api/apartments/:apartmentId', () => {
		it('Should not delete apartment if no one signed in', (done) => {
			let token;
			request(app)
				.delete('/api/apartments/' + apartment2.id)
				.expect(401)
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
		it('Should delete apartments if realtor is logged in', (done) => {
			request(app)
				.delete('/api/apartments/' + apartment1.id)
				.set('Cookie', token)
				.expect(200)
				.end((err, response) => {
					expect(response.body)
						.to.have.property('success')
						.to.equal(true);
					done(err);
				});
		});
		it('Should not delete apartments if realtor is not same', (done) => {
			request(app)
				.delete('/api/apartments/' + apartment2.id)
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
		it('Should not delete apartment if client is logged in', (done) => {
			request(app)
				.delete('/api/apartments/' + apartment2.id)
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
		it('Should delete apartment if admin is logged in', (done) => {
			request(app)
				.delete('/api/apartments/' + apartment2.id)
				.set('Cookie', token)
				.expect(200)
				.end((err, response) => {
					expect(response.body)
						.to.have.property('success')
						.to.equal(true);
					done(err);
				});
		});
		it('Should not delete apartment if admin is logged in but apartment id is invalid', (done) => {
			request(app)
				.delete('/api/apartments/' + apartment2.id)
				.set('Cookie', token)
				.expect(404)
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
