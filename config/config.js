/**
 * Central configuration.
 * All credentials are read from environment variables — never committed.
 *
 * Supply at runtime:
 *   DEMOQA_USERNAME=xxx DEMOQA_PASSWORD=xxx REQRES_PROJECT_KEY=xxx npx playwright test
 * Or create a .env file (git-ignored) and load with dotenv-cli:
 *   npx dotenv -e .env -- npx playwright test
 */
const config = {
  demoqa: {
    baseUrl:  'https://demoqa.com',
    username: process.env.DEMOQA_USERNAME || '',
    password: process.env.DEMOQA_PASSWORD || ''
  },
  reqres: {
    baseUrl: 'https://reqres.in',

    // Project key (pro_* or environment-scoped key) — required for persistent collections.
    // Get yours at: https://app.reqres.in/api-keys
    // The free_user_* key only works with the legacy /api/users demo endpoints.
    projectKey: process.env.REQRES_PROJECT_KEY || '',

    // The slug of the collection to use for CRUD operations.
    // Your starter project on reqres.in includes a "products" collection by default.
    // Create a custom collection (e.g. "users") at app.reqres.in/collections if preferred.
    collection: process.env.REQRES_COLLECTION || 'products'
  },
  bookSearch: {
    title: 'Learning JavaScript Design Patterns'
  },
  outputFile: 'test-output/book-details.txt'
};

module.exports = config;
