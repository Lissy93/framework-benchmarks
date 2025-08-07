const fs = require('fs');
const path = require('path');

const readmePath = path.join(__dirname, 'README.txt');

fs.readFile(readmePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading README.txt:', err.message);
    process.exit(1);
  }
  console.log('\x1b[34m' + data);
});
