const chai = require('chai');
const expect = chai.expect;
const request = require('supertest');
const app = require('../server');

describe('Main Application Routes', () => {
  describe('GET /', () => {
    it('should render the homepage', (done) => {
      request(app)
        .get('/')
        .expect(200)
        .expect('Content-Type', /html/)
        .end(done);
    });

    it('should contain welcome content', (done) => {
      request(app)
        .get('/')
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.text).to.include('MeLorAly');
          done();
        });
    });
  });

  describe('GET /nonexistent-route', () => {
    it('should return 404 for non-existent routes', (done) => {
      request(app)
        .get('/this-route-does-not-exist')
        .expect(404)
        .end(done);
    });
  });
});

describe('Server Health', () => {
  it('should have Express app defined', () => {
    expect(app).to.exist;
    expect(app).to.be.a('function');
  });
});
