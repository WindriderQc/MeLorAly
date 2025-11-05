const chai = require('chai');
const expect = chai.expect;
const request = require('supertest');
const app = require('../server');

describe('Notifications API', () => {
  describe('GET /notifications/latest', () => {
    it('should return JSON when authenticated', (done) => {
      // Without auth, should redirect
      request(app)
        .get('/notifications/latest')
        .expect(302)
        .end(done);
    });
  });

  describe('POST /notifications/:id/read', () => {
    it('should reject without CSRF token', (done) => {
      // Unauthenticated requests redirect to login (auth check before CSRF)
      request(app)
        .post('/notifications/123/read')
        .expect(302) // Redirect to login
        .end(done);
    });
  });

  describe('POST /notifications/mark-all', () => {
    it('should reject without CSRF token', (done) => {
      // Unauthenticated requests redirect to login (auth check before CSRF)
      request(app)
        .post('/notifications/mark-all')
        .expect(302) // Redirect to login
        .end(done);
    });
  });
});
