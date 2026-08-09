/**
 * Central configuration.
 * All credentials are read from environment variables — never committed.
 *
 * Windows PowerShell:
 *   $env:DEMOQA_USERNAME="..."; $env:DEMOQA_PASSWORD="..."
 *   $env:REQRES_PROJECT_KEY="pro_..."; $env:REQRES_COLLECTION="products"
 *   npx playwright test
 *
 * Mac/Linux:
 *   DEMOQA_USERNAME=... DEMOQA_PASSWORD=... REQRES_PROJECT_KEY=pro_... REQRES_COLLECTION=products npx playwright test
 */
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
