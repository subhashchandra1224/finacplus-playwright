/**
 * Central configuration.
 * Loads .env file if present, then reads from environment variables.
 *
 * Setup:
 *   cp .env.example .env
 *   Fill in your values, then run: npx playwright test
 */
require('dotenv').config();

const config = {
  demoqa: {
    baseUrl:  'https://demoqa.com',
    username: process.env.DEMOQA_USERNAME || '',
    password: process.env.DEMOQA_PASSWORD || ''
  },
  reqres: {
    baseUrl:    'https://reqres.in',
    projectKey: process.env.REQRES_PROJECT_KEY || '',
    collection: process.env.REQRES_COLLECTION  || 'users'
  },
  bookSearch: {
    title: 'Learning JavaScript Design Patterns'
  },
  outputFile: 'test-output/book-details.txt'
};

module.exports = config;
