const chai = require('chai');
const expect = chai.expect;
const request = require('supertest');
const app = require('../server');

describe('Authentication Routes', () => {
  describe('GET /auth/login', () => {
    it('should render the login page', (done) => {
      request(app)
        .get('/auth/login')
        .expect(200)
        .expect('Content-Type', /html/)
        .end(done);
    });

    it('should contain login form', (done) => {
      request(app)
        .get('/auth/login')
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.text).to.include('email');
          expect(res.text).to.include('password');
          done();
        });
    });
  });

  describe('GET /auth/register', () => {
    it('should render the registration page', (done) => {
      request(app)
        .get('/auth/register')
        .expect(200)
        .expect('Content-Type', /html/)
        .end(done);
    });

    it('should contain registration form', (done) => {
      request(app)
        .get('/auth/register')
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.text).to.include('email');
          expect(res.text).to.include('password');
          // Form uses 'name' attribute which might be 'first_name' or split
          expect(res.text).to.match(/name|prénom/i);
          done();
        });
    });
  });

  describe('POST /auth/login', () => {
    it('should reject login without credentials', (done) => {
      request(app)
        .post('/auth/login')
        .send({})
        .expect(302) // Redirect back to login
        .end(done);
    });

    it('should reject invalid email format', (done) => {
      request(app)
        .post('/auth/login')
        .send({ email: 'invalid-email', password: 'password123' })
        .expect(302)
        .end(done);
    });
  });

  describe('GET /auth/logout', () => {
    it('should redirect after logout', (done) => {
      request(app)
        .get('/auth/logout')
        .expect(302)
        .end(done);
    });
  });
});
