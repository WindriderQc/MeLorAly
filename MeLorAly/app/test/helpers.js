/**
 * Test Utilities and Helpers
 * 
 * This file contains helper functions for testing authenticated routes,
 * mock data generation, and common test utilities.
 */

const request = require('supertest');

/**
 * Helper to create a test user session
 * Note: This is a placeholder for future implementation when we add
 * authentication testing with actual Supabase test instances.
 * 
 * @param {Object} app - Express app instance
 * @param {Object} userData - User data for login
 * @returns {Promise} - Agent with session cookie
 */
async function authenticateUser(app, userData = {}) {
  const agent = request.agent(app);
  
  // TODO: Implement actual login flow when test database is configured
  // For now, this is a placeholder that returns the agent
  // 
  // await agent
  //   .post('/auth/login')
  //   .send({
  //     email: userData.email || 'test@example.com',
  //     password: userData.password || 'test123456'
  //   });
  
  return agent;
}

/**
 * Mock family data generator
 */
function mockFamily(overrides = {}) {
  return {
    id: 'mock-family-id',
    name: 'Test Family',
    created_at: new Date().toISOString(),
    ...overrides
  };
}

/**
 * Mock child data generator
 */
function mockChild(overrides = {}) {
  return {
    id: 'mock-child-id',
    name: 'Test Child',
    birth_date: '2015-01-01',
    grade: '3e année',
    family_id: 'mock-family-id',
    ...overrides
  };
}

/**
 * Mock user data generator
 */
function mockUser(overrides = {}) {
  return {
    id: 'mock-user-id',
    email: 'test@example.com',
    first_name: 'Test',
    last_name: 'User',
    role: 'parent',
    ...overrides
  };
}

/**
 * Sleep utility for async operations
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
  authenticateUser,
  mockFamily,
  mockChild,
  mockUser,
  sleep
};
