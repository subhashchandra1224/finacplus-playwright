/**
 * Page Object — DemoQA Profile Page
 */
class ProfilePage {
  constructor(page) {
    this.page             = page;
    this.usernameLabel    = page.locator('#userName-value');
    this.goToStoreButton  = page.locator('#gotoStore');
    this.logoutButton     = page.locator('button#submit, button:has-text("Log out"), button:has-text("Log Out")').first();
  }

  async getLoggedInUsername() {
    await this.usernameLabel.waitFor({ state: 'visible' });
    return (await this.usernameLabel.innerText()).trim();
  }

  async isLogoutButtonVisible() {
    await this.logoutButton.waitFor({ state: 'visible' });
    return await this.logoutButton.isVisible();
  }

  async navigateToBookStore() {
    await this.goToStoreButton.scrollIntoViewIfNeeded();
    await this.goToStoreButton.click();
    await this.page.waitForURL('**/books**');
  }

  async clickLogout() {
    await this.logoutButton.scrollIntoViewIfNeeded();
    await this.logoutButton.click();
    await this.page.waitForURL('**/login**');
  }
}

module.exports = { ProfilePage };
