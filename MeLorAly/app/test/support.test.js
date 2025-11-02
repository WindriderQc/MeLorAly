const chai = require('chai');
const expect = chai.expect;
const request = require('supertest');
const app = require('../server');

describe('Support Routes', () => {
  describe('GET /faq', () => {
    it('should render the FAQ page', (done) => {
      request(app)
        .get('/faq')
        .expect(200)
        .expect('Content-Type', /html/)
        .end(done);
    });

    it('should contain FAQ content', (done) => {
      request(app)
        .get('/faq')
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.text).to.include('FAQ');
          done();
        });
    });
  });

  describe('GET /contact', () => {
    it('should render the contact page', (done) => {
      request(app)
        .get('/contact')
        .expect(200)
        .expect('Content-Type', /html/)
        .end(done);
    });

    it('should contain contact form', (done) => {
      request(app)
        .get('/contact')
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.text).to.include('contact');
          done();
        });
    });
  });

  describe('POST /contact/send', () => {
    it('should reject empty contact form', (done) => {
      request(app)
        .post('/contact/send')
        .send({})
        .expect(302) // Redirect back to form with error
        .end(done);
    });
  });
});
