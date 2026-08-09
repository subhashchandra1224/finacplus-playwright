const fs   = require('fs');
const path = require('path');

/**
 * Writes extracted book details to a text file.
 * Creates the output directory if it does not exist.
 */
function writeBookDetailsToFile(title, author, publisher, filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const content =
    'Book Details\n' +
    '============\n\n' +
    `Title      : ${title}\n` +
    `Author     : ${author}\n` +
    `Publisher  : ${publisher}\n`;

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Book details written to ${filePath}`);
}

module.exports = { writeBookDetailsToFile };
