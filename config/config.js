/**
 * Central configuration.
 * All credentials are read from environment variables — never committed.
 *
 * Supply at runtime (Windows PowerShell):
 *   $env:DEMOQA_USERNAME="..."; $env:DEMOQA_PASSWORD="..."; $env:REQRES_API_KEY="..."; npx playwright test
 *
 * Mac/Linux:
 *   DEMOQA_USERNAME=... DEMOQA_PASSWORD=... REQRES_API_KEY=... npx playwright test
 */
const config = {
  demoqa: {
    baseUrl:  'https://demoqa.com',
    username: process.env.DEMOQA_USERNAME || '',
    password: process.env.DEMOQA_PASSWORD || ''
  },
  reqres: {
    baseUrl: 'https://reqres.in',
    // Free API key from https://app.reqres.in — works with the standard /api/users endpoint
    apiKey: process.env.REQRES_API_KEY || ''
  },
  bookSearch: {
    title: 'Learning JavaScript Design Patterns'
  },
  outputFile: 'test-output/book-details.txt'
};

module.exports = config;
