const fs = require('fs');

let css = fs.readFileSync('src/App.css', 'utf8');

// The mobile media query starts around line 677.
// We need to add `order: 0;` to .premium-header-left, .premium-header-center, .premium-header-right inside this block.

css = css.replace(
  /\.premium-header-left\s*\{\s*flex:\s*1;\s*min-width:\s*0;/g,
  `.premium-header-left { order: 0; flex: 1; min-width: 0;`
);

css = css.replace(
  /\.premium-header-center\s*\{\s*flex-shrink:\s*0;\s*display:\s*flex;/g,
  `.premium-header-center { order: 0; flex-shrink: 0; display: flex;`
);

css = css.replace(
  /\.premium-header-right\s*\{\s*flex-shrink:\s*0;\s*position:\s*static;/g,
  `.premium-header-right { order: 0; flex-shrink: 0; position: static;`
);

fs.writeFileSync('src/App.css', css);
console.log('App.css mobile fixes applied.');
