const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

code = code.replace(
  /<th>Sample ID<\/th>/,
  '<th>Sample No.</th>'
);

code = code.replace(
  /data-label="Sample ID"/,
  'data-label="Sample No."'
);

fs.writeFileSync('src/App.jsx', code);
