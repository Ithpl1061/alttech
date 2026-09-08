const fs = require('fs');
let css = fs.readFileSync('src/App.css', 'utf8');

// Insert order resets at the top of the mobile media query
const mobileResets = `
  .premium-header-left { order: 1 !important; }
  .premium-header-center { order: 2 !important; }
  .premium-header-right { order: 3 !important; }
`;

css = css.replace(/@media \(max-width: 768px\) \{/, '@media (max-width: 768px) {\n' + mobileResets);

fs.writeFileSync('src/App.css', css);
console.log('App.css mobile order reset applied.');
