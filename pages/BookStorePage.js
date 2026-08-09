/**
 * Page Object — DemoQA Book Store Page
 */
class BookStorePage {
  constructor(page) {
    this.page      = page;
    this.searchBox = page.locator('#searchBox');
  }

  async searchForBook(title) {
    await this.searchBox.waitFor({ state: 'visible' });
    await this.searchBox.fill(title);
  }

  async isBookDisplayed(title) {
    try {
      const link = this.page.locator(`a:has-text("${title}")`);
      await link.waitFor({ state: 'visible', timeout: 10000 });
      return await link.isVisible();
    } catch {
      return false;
    }
  }

  /**
   * Extracts [title, author, publisher] for the given book from the live DOM.
   * Throws if the row cannot be found or columns are missing.
   *
   * DemoQA Book Store now uses a native HTML table (TR/TD):
   *   TR
   *     TD[0] — book image
   *     TD[1] — title  (contains the anchor link)
   *     TD[2] — author
   *     TD[3] — publisher
   *
   * Strategy: locate the anchor link by text, walk up to the TR ancestor,
   * then read sibling TD cells using JavaScript evaluation.
   */
  async getBookDetails(title) {
    // Wait for the title link to be visible
    const titleLink = this.page.locator(`a`).filter({ hasText: title }).first();
    try {
      await titleLink.waitFor({ state: 'visible', timeout: 10000 });
    } catch (e) {
      throw new Error(`Book link not found for: "${title}". ${e.message}`);
    }

    // Use JavaScript to walk up to the TR ancestor and extract TD text values
    const details = await this.page.evaluate((searchTitle) => {
      const links = Array.from(document.querySelectorAll('a'));
      const link  = links.find(a => a.textContent.trim() === searchTitle);
      if (!link) return null;

      // Walk up to the TR ancestor
      let el = link;
      while (el && el.tagName !== 'TR') {
        el = el.parentElement;
      }
      if (!el) return null;

      // Native table: TD[0]=image, TD[1]=title, TD[2]=author, TD[3]=publisher
      const cells = el.querySelectorAll('td');
      if (cells.length < 4) return null;

      return {
        title:     cells[1].textContent.trim(),
        author:    cells[2].textContent.trim(),
        publisher: cells[3].textContent.trim()
      };
    }, title);

    if (!details) {
      throw new Error(
        `Could not extract row data for book: "${title}". ` +
        `The table row or columns were not found.`
      );
    }

    if (!details.title || !details.author || !details.publisher) {
      throw new Error(
        `Extracted empty fields for "${title}": ` +
        `title="${details.title}", author="${details.author}", publisher="${details.publisher}"`
      );
    }

    return details;
  }
}

module.exports = { BookStorePage };
