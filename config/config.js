/**
 * Central configuration.
 * Credentials are read from environment variables so they are never
 * committed to the repository.
 *
 * Supply them at runtime:
 *   DEMOQA_USERNAME=xxx DEMOQA_PASSWORD=xxx REQRES_API_KEY=xxx npx playwright test
 * Or create a .env file (git-ignored) and load it with dotenv.
 */
const config = {
  demoqa: {
    baseUrl: 'https://demoqa.com',
    username: process.env.DEMOQA_USERNAME || '',
    password: process.env.DEMOQA_PASSWORD || ''
  },
  reqres: {
    baseUrl: 'https://reqres.in',
    apiKey: process.env.REQRES_API_KEY || ''
  },
  bookSearch: {
    title: 'Learning JavaScript Design Patterns'
  },
  outputFile: 'test-output/book-details.txt'
};

module.exports = config;
