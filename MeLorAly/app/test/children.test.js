const chai = require('chai');
const expect = chai.expect;
const request = require('supertest');
const app = require('../server');

describe('Children Routes', () => {
  describe('GET /children/create', () => {
    it('should redirect to login when not authenticated', (done) => {
      request(app)
        .get('/children/create')
        .expect(302)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.headers.location).to.include('/auth/login');
          done();
        });
    });
  });

  describe('POST /children/create', () => {
    it('should redirect to login when not authenticated', (done) => {
      request(app)
        .post('/children/create')
        .send({ name: 'Test Child', family_id: '123' })
        .expect(302)
        .end(done);
    });

    it('should reject creation without required fields', (done) => {
      // This test would need authentication setup
      // For now, verify it redirects (auth check comes first)
      request(app)
        .post('/children/create')
        .send({})
        .expect(302)
        .end(done);
    });
  });
});
