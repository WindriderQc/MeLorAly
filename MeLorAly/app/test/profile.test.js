const chai = require('chai');
const expect = chai.expect;
const request = require('supertest');
const app = require('../server');

describe('Profile Routes', () => {
  describe('GET /profile', () => {
    it('should redirect to login when not authenticated', (done) => {
      request(app)
        .get('/profile')
        .expect(302)
        .end(done);
    });
  });

  describe('GET /profile/edit', () => {
    it('should redirect to login when not authenticated', (done) => {
      request(app)
        .get('/profile/edit')
        .expect(302)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.headers.location).to.include('/auth/login');
          done();
        });
    });
  });

  describe('POST /profile/update', () => {
    it('should redirect to login when not authenticated', (done) => {
      request(app)
        .post('/profile/update')
        .send({ first_name: 'Test', last_name: 'User' })
        .expect(302)
        .end(done);
    });
  });

  describe('POST /profile/change-password', () => {
    it('should redirect to login when not authenticated', (done) => {
      request(app)
        .post('/profile/change-password')
        .send({ current_password: 'old', new_password: 'new' })
        .expect(302)
        .end(done);
    });
  });
});
