const chai = require('chai');
const expect = chai.expect;
const request = require('supertest');
const app = require('../server');

describe('Family Routes', () => {
  describe('GET /family', () => {
    it('should redirect to login when not authenticated', (done) => {
      request(app)
        .get('/family')
        .expect(302)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.headers.location).to.include('/auth/login');
          done();
        });
    });
  });

  describe('GET /family/create', () => {
    it('should redirect to login when not authenticated', (done) => {
      request(app)
        .get('/family/create')
        .expect(302)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.headers.location).to.include('/auth/login');
          done();
        });
    });
  });

  describe('POST /family/create', () => {
    it('should redirect to login when not authenticated', (done) => {
      request(app)
        .post('/family/create')
        .send({ name: 'Test Family' })
        .expect(302)
        .end(done);
    });
  });
});
