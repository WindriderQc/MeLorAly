const chai = require('chai');
const expect = chai.expect;
const request = require('supertest');
const app = require('../server');

describe('Dashboard Routes', () => {
  describe('GET /dashboard', () => {
    it('should redirect to login when not authenticated', (done) => {
      request(app)
        .get('/dashboard')
        .expect(302)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.headers.location).to.include('/auth/login');
          done();
        });
    });
  });

  describe('GET /dashboard/grandparent', () => {
    it('should redirect to login when not authenticated', (done) => {
      request(app)
        .get('/dashboard/grandparent')
        .expect(302)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.headers.location).to.include('/auth/login');
          done();
        });
    });
  });
});
