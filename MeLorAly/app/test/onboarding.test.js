const chai = require('chai');
const expect = chai.expect;
const request = require('supertest');
const app = require('../server');

describe('Onboarding Routes', () => {
  describe('GET /onboarding/welcome', () => {
    it('should redirect to login when not authenticated', (done) => {
      request(app)
        .get('/onboarding/welcome')
        .expect(302)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.headers.location).to.include('/auth/login');
          done();
        });
    });
  });

  describe('GET /onboarding/children', () => {
    it('should redirect to login when not authenticated', (done) => {
      request(app)
        .get('/onboarding/children')
        .expect(302)
        .end(done);
    });
  });

  describe('GET /onboarding/adults', () => {
    it('should redirect to login when not authenticated', (done) => {
      request(app)
        .get('/onboarding/adults')
        .expect(302)
        .end(done);
    });
  });

  describe('GET /onboarding/family-space', () => {
    it('should redirect to login when not authenticated', (done) => {
      request(app)
        .get('/onboarding/family-space')
        .expect(302)
        .end(done);
    });
  });

  describe('GET /onboarding/ready', () => {
    it('should redirect to login when not authenticated', (done) => {
      request(app)
        .get('/onboarding/ready')
        .expect(302)
        .end(done);
    });
  });
});
