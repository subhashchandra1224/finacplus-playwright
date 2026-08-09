/**
 * Central configuration.
 * All credentials are read from environment variables — never committed.
 *
 * Supply at runtime (Windows PowerShell):
 *   $env:DEMOQA_USERNAME="..."; $env:DEMOQA_PASSWORD="..."; $env:REQRES_PROJECT_KEY="..."; $env:REQRES_COLLECTION="products"; npx playwright test
 *
 * Mac/Linux:
 *   DEMOQA_USERNAME=... DEMOQA_PASSWORD=... REQRES_PROJECT_KEY=... REQRES_COLLECTION=products npx playwright test
 */
const config = {
  demoqa: {
    baseUrl:  'https://demoqa.com',
    username: process.env.DEMOQA_USERNAME || '',
    password: process.env.DEMOQA_PASSWORD || ''
  },
  reqres: {
    baseUrl:    'https://reqres.in',
    // Manage key (pro_* prefix) from https://app.reqres.in/api-keys
    // Required for the persistent collections API — supports real Create/GET/Update.
    projectKey: process.env.REQRES_PROJECT_KEY || '',
    // Collection slug — starter project includes "products" by default.
    collection: process.env.REQRES_COLLECTION || 'products'
  },
  bookSearch: {
    title: 'Learning JavaScript Design Patterns'
  },
  outputFile: 'test-output/book-details.txt'
};

module.exports = config;
