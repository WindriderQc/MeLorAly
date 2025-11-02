# Test Suite Documentation

## Overview

The MeLorAly test suite uses **Mocha** (test framework), **Chai** (assertions), and **Supertest** (HTTP testing) to ensure application reliability and prevent regressions.

## Test Statistics

- **Total Tests:** 38
- **Status:** ✅ All passing
- **Coverage:** Core routes and authentication flows

## Running Tests

```bash
# Run all tests
npm test

# Run tests with verbose output
npm test -- --reporter spec

# Run specific test file
npm test -- test/auth.test.js

# Run tests in watch mode (requires nodemon)
npx nodemon --exec npm test
```

## Test Structure

```
test/
├── app.test.js           # Main app routes (4 tests)
├── auth.test.js          # Authentication (10 tests)
├── children.test.js      # Children profiles (3 tests)
├── dashboard.test.js     # Dashboard routes (2 tests)
├── education.test.js     # Educational resources (2 tests)
├── family.test.js        # Family management (3 tests)
├── helpers.js            # Test utilities
├── notifications.test.js # Notifications API (3 tests)
├── onboarding.test.js    # Onboarding flow (5 tests)
├── profile.test.js       # User profiles (4 tests)
└── support.test.js       # FAQ and contact (5 tests)
```

## Test Categories

### 1. **Main Application Routes** (4 tests)
- ✅ Homepage rendering
- ✅ Welcome content validation
- ✅ 404 error handling
- ✅ Express app health check

### 2. **Authentication** (10 tests)
- ✅ Login page rendering
- ✅ Login form validation
- ✅ Registration page rendering
- ✅ Registration form validation
- ✅ Empty credentials rejection
- ✅ Invalid email format rejection
- ✅ Logout redirect
- ✅ Session management

### 3. **Dashboard** (2 tests)
- ✅ Parent dashboard auth protection
- ✅ Grandparent dashboard auth protection

### 4. **Family Management** (3 tests)
- ✅ Family list auth protection
- ✅ Family creation auth protection
- ✅ POST validation

### 5. **Children Profiles** (3 tests)
- ✅ Create form auth protection
- ✅ POST creation auth protection
- ✅ Required field validation

### 6. **Education** (2 tests)
- ✅ Resources page auth protection
- ✅ CSRF protection on completion

### 7. **Onboarding Flow** (5 tests)
- ✅ Welcome step auth protection
- ✅ Children step auth protection
- ✅ Adults step auth protection
- ✅ Family space step auth protection
- ✅ Ready step auth protection

### 8. **Profile Management** (4 tests)
- ✅ Profile root redirect
- ✅ Edit page auth protection
- ✅ Update auth protection
- ✅ Password change auth protection

### 9. **Notifications** (3 tests)
- ✅ Latest notifications API
- ✅ CSRF protection on mark-as-read
- ✅ CSRF protection on mark-all

### 10. **Support** (5 tests)
- ✅ FAQ page rendering
- ✅ FAQ content validation
- ✅ Contact page rendering
- ✅ Contact form validation
- ✅ Empty form rejection

## Test Patterns

### Authentication Protection Test
```javascript
it('should redirect to login when not authenticated', (done) => {
  request(app)
    .get('/protected-route')
    .expect(302)
    .end((err, res) => {
      if (err) return done(err);
      expect(res.headers.location).to.include('/auth/login');
      done();
    });
});
```

### Form Rendering Test
```javascript
it('should render the page with form', (done) => {
  request(app)
    .get('/form-page')
    .expect(200)
    .expect('Content-Type', /html/)
    .end((err, res) => {
      if (err) return done(err);
      expect(res.text).to.include('expected-field');
      done();
    });
});
```

### CSRF Protection Test
```javascript
it('should reject without CSRF token', (done) => {
  request(app)
    .post('/csrf-protected-route')
    .send({ data: 'test' })
    .expect(500) // CSRF error
    .end(done);
});
```

## Test Helpers

The `test/helpers.js` file provides utilities for testing:

### Mock Data Generators
```javascript
const { mockFamily, mockChild, mockUser } = require('./helpers');

const testFamily = mockFamily({ name: 'Test Family' });
const testChild = mockChild({ name: 'Test Child' });
const testUser = mockUser({ email: 'test@example.com' });
```

### Future: Authentication Helper
```javascript
// TODO: Implement when test database is configured
const { authenticateUser } = require('./helpers');

const agent = await authenticateUser(app, {
  email: 'test@example.com',
  password: 'password123'
});
```

## Testing Best Practices

### 1. **Test Isolation**
- Each test should be independent
- No shared state between tests
- Use beforeEach/afterEach for setup/teardown

### 2. **Descriptive Names**
- Use clear, action-oriented test names
- Follow pattern: "should [expected behavior] when [condition]"

### 3. **Assertion Clarity**
- One primary assertion per test
- Use descriptive error messages
- Test both success and failure cases

### 4. **Async Handling**
- Always use done() callback or return promises
- Handle errors in async operations
- Set appropriate timeouts for slow operations

## Adding New Tests

### 1. Create a new test file
```javascript
// test/new-feature.test.js
const chai = require('chai');
const expect = chai.expect;
const request = require('supertest');
const app = require('../server');

describe('New Feature Routes', () => {
  it('should do something', (done) => {
    // Test implementation
    done();
  });
});
```

### 2. Run the new tests
```bash
npm test
```

### 3. Verify coverage
```bash
# Check that your feature is tested
npm test -- --grep "New Feature"
```

## Known Limitations

### 1. **No Database Tests**
- Current tests don't interact with real Supabase
- Authenticated routes are tested for redirect behavior only
- Future: Set up test database for full integration tests

### 2. **No Session Simulation**
- Tests can't simulate authenticated sessions yet
- Auth helper is a placeholder
- Future: Implement cookie-based session testing

### 3. **CSRF Token Handling**
- CSRF-protected routes tested for rejection only
- Can't test successful POST with valid tokens
- Future: Extract and use CSRF tokens in tests

## Future Improvements

### Short-term
- [ ] Add test database configuration
- [ ] Implement authenticated session tests
- [ ] Test successful form submissions
- [ ] Add validation error message tests

### Medium-term
- [ ] Integration tests with real Supabase
- [ ] Test email sending (with mock SMTP)
- [ ] Test file upload functionality
- [ ] Add code coverage reporting

### Long-term
- [ ] E2E tests with Playwright/Cypress
- [ ] Performance testing
- [ ] Load testing
- [ ] Security testing (SQL injection, XSS)

## Continuous Integration

### GitHub Actions (Recommended)
```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '20'
      - run: npm install
      - run: npm test
```

## Troubleshooting

### Tests failing with "EADDRINUSE"
Server already running on port 3012. Stop it before running tests.

### Tests timing out
Increase timeout in test file:
```javascript
this.timeout(5000); // 5 seconds
```

### CSRF token errors
Expected behavior for routes with CSRF protection. Tests verify the protection works.

### Session warnings
MemoryStore warnings are normal in test environment.

## Contributing

When adding new features:
1. ✅ Write tests first (TDD approach)
2. ✅ Ensure tests pass before committing
3. ✅ Update this documentation
4. ✅ Add tests to relevant category

---

**Test Suite Maintained By:** MeLorAly Development Team  
**Last Updated:** November 2, 2025  
**Status:** ✅ All 38 tests passing
