const { test, expect } = require('@playwright/test');
const { LoginPage }    = require('../../pages/LoginPage');
const { ProfilePage }  = require('../../pages/ProfilePage');
const { BookStorePage } = require('../../pages/BookStorePage');
const { writeBookDetailsToFile } = require('../../utils/fileUtils');
const config = require('../../config/config');

// ---------------------------------------------------------------------------
// Guard: fail immediately with a clear message if credentials are not set
// ---------------------------------------------------------------------------
test.beforeAll(() => {
  if (!config.demoqa.username || !config.demoqa.password) {
    throw new Error(
      'DemoQA credentials are not configured.\n' +
      'Set environment variables: DEMOQA_USERNAME and DEMOQA_PASSWORD\n' +
      'Example: DEMOQA_USERNAME=myuser DEMOQA_PASSWORD=mypass npx playwright test'
    );
  }
});

// ---------------------------------------------------------------------------
// Happy-path: full Book Store flow
// ---------------------------------------------------------------------------
test('Book Store flow — login, search, extract details, logout', async ({ page }) => {
  const loginPage    = new LoginPage(page);
  const profilePage  = new ProfilePage(page);
  const bookStorePage = new BookStorePage(page);

  // 1. Navigate to login and login
  await loginPage.navigate(config.demoqa.baseUrl);
  await loginPage.login(config.demoqa.username, config.demoqa.password);

  // Fail fast if login was rejected
  const failed = await loginPage.isLoginFailed();
  expect(failed, 'Login should succeed with the configured credentials').toBe(false);

  // 2. Validate username and logout button on Profile page
  const actualUsername = await profilePage.getLoggedInUsername();
  expect(actualUsername).toBe(config.demoqa.username);

  const logoutVisible = await profilePage.isLogoutButtonVisible();
  expect(logoutVisible, 'Logout button must be visible after login').toBe(true);

  // 3. Navigate to Book Store via the UI button
  await profilePage.navigateToBookStore();

  // 4. Search for the book
  await bookStorePage.searchForBook(config.bookSearch.title);

  // 5. Validate the book appears in results
  const bookFound = await bookStorePage.isBookDisplayed(config.bookSearch.title);
  expect(bookFound, `Book "${config.bookSearch.title}" must appear in search results`).toBe(true);

  // 6. Extract Title, Author, Publisher dynamically from the DOM
  const details = await bookStorePage.getBookDetails(config.bookSearch.title);

  // 7. Assert extracted values are non-empty before writing
  expect(details.title.length,     'Extracted title must not be empty').toBeGreaterThan(0);
  expect(details.author.length,    'Extracted author must not be empty').toBeGreaterThan(0);
  expect(details.publisher.length, 'Extracted publisher must not be empty').toBeGreaterThan(0);

  console.log(`Title     : ${details.title}`);
  console.log(`Author    : ${details.author}`);
  console.log(`Publisher : ${details.publisher}`);

  // 8. Write to file
  writeBookDetailsToFile(details.title, details.author, details.publisher, config.outputFile);

  // 9. Logout via UI button
  await profilePage.clickLogout();

  // 10. Verify redirect to login page
  expect(page.url()).toContain('/login');
});

// ---------------------------------------------------------------------------
// Negative: invalid credentials must not log in
// ---------------------------------------------------------------------------
test('Invalid login — shows error, stays on login page', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.navigate(config.demoqa.baseUrl);
  await loginPage.login('invalidUser_xyz', 'wrongPassword_123');

  const failed = await loginPage.isLoginFailed();
  expect(failed, 'Error must be shown for invalid credentials').toBe(true);
  expect(page.url()).not.toContain('/profile');
});

// ---------------------------------------------------------------------------
// Negative: non-existent book search returns no result
// ---------------------------------------------------------------------------
test('Non-existent book search — no result shown', async ({ page }) => {
  const loginPage     = new LoginPage(page);
  const profilePage   = new ProfilePage(page);
  const bookStorePage = new BookStorePage(page);
  const fakeTitle     = 'This Book Does Not Exist XYZ12345';

  await loginPage.navigate(config.demoqa.baseUrl);
  await loginPage.login(config.demoqa.username, config.demoqa.password);

  const failed = await loginPage.isLoginFailed();
  expect(failed, 'Login must succeed to reach the Book Store').toBe(false);

  await profilePage.navigateToBookStore();
  await bookStorePage.searchForBook(fakeTitle);

  const found = await bookStorePage.isBookDisplayed(fakeTitle);
  expect(found, `No result expected for "${fakeTitle}"`).toBe(false);

  await profilePage.clickLogout();
});
