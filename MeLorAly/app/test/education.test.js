const chai = require('chai');
const expect = chai.expect;
const request = require('supertest');
const app = require('../server');

describe('Education Routes', () => {
  describe('GET /education', () => {
    it('should redirect to login when not authenticated', (done) => {
      request(app)
        .get('/education')
        .expect(302)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.headers.location).to.include('/auth/login');
          done();
        });
    });
  });

  describe('POST /education/activity/:id/complete', () => {
    it('should reject without CSRF token', (done) => {
      // CSRF protected routes return 500 without valid token
      request(app)
        .post('/education/activity/123/complete')
        .send({ child_id: '456' })
        .expect(500) // CSRF error
        .end(done);
    });
  });
});
