/**
 * Page Object — DemoQA Profile Page
 */
class ProfilePage {
  constructor(page) {
    this.page            = page;
    this.usernameLabel   = page.locator('#userName-value');
    this.goToStoreButton = page.locator('#gotoStore');
    this.logoutButton    = page.locator('button#submit, button:has-text("Log out"), button:has-text("Log Out")').first();
  }

  /**
   * Dismisses any ad overlay that DemoQA may place over the page.
   * Tries common ad close patterns; silently continues if none are found.
   */
  async dismissAds() {
    const adSelectors = [
      '#close-fixedban',
      '.fc-button-label',
      '[id*="close"]',
      '[class*="close"]',
      'iframe'
    ];
    for (const selector of adSelectors) {
      try {
        const el = this.page.locator(selector).first();
        if (await el.isVisible({ timeout: 1000 })) {
          await el.click({ timeout: 1000 }).catch(() => {});
        }
      } catch {
        // No ad found — continue
      }
    }
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
    await this.dismissAds();
    await this.goToStoreButton.scrollIntoViewIfNeeded();
    try {
      await this.goToStoreButton.click({ timeout: 5000 });
    } catch {
      // JS fallback if ad still intercepts
      await this.page.evaluate(() => {
        document.querySelector('#gotoStore')?.click();
      });
    }
    await this.page.waitForURL('**/books**');
  }

  async clickLogout() {
    await this.dismissAds();
    await this.logoutButton.scrollIntoViewIfNeeded();
    try {
      await this.logoutButton.click({ timeout: 5000 });
    } catch {
      await this.page.evaluate(() => {
        const btn = document.querySelector('button#submit') ||
                    Array.from(document.querySelectorAll('button'))
                         .find(b => b.textContent.includes('Log out') || b.textContent.includes('Log Out'));
        btn?.click();
      });
    }
    await this.page.waitForURL('**/login**');
  }
}

module.exports = { ProfilePage };
