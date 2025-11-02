const chai = require('chai');
const expect = chai.expect;
const request = require('supertest');
const app = require('../server');

describe('Authentication Routes', () => {
  it('should render the login page', (done) => {
    request(app)
      .get('/auth/login')
      .expect(200, done);
  });
});
