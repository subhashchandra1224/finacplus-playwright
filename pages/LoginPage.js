/**
 * Page Object — DemoQA Login Page
 */
class LoginPage {
  constructor(page) {
    this.page = page;
    this.usernameInput = page.locator('#userName');
    this.passwordInput = page.locator('#password');
    this.loginButton   = page.locator('#login');
    this.errorOutput   = page.locator('#output');
  }

  async navigate(baseUrl) {
    await this.page.goto(`${baseUrl}/login`);
  }

  async login(username, password) {
    await this.usernameInput.waitFor({ state: 'visible' });
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    // Scroll button into view to avoid ad interception
    await this.loginButton.scrollIntoViewIfNeeded();
    await this.loginButton.click();
  }

  async isLoginFailed() {
    try {
      await this.errorOutput.waitFor({ state: 'visible', timeout: 5000 });
      const text = (await this.errorOutput.innerText()).trim();
      return text.length > 0;
    } catch {
      return false;
    }
  }
}

module.exports = { LoginPage };
