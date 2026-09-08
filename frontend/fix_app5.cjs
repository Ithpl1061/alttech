const fs = require('fs');

const content = fs.readFileSync('src/App.jsx', 'utf8');
const lines = content.split('\n');

// Remove lines 126 to 251 inclusive (index 125 to 250, which is 126 items)
lines.splice(125, 126);

fs.writeFileSync('src/App.jsx', lines.join('\n'));
console.log("Fixed App.jsx by removing garbage block!");
