const fs = require('fs');
let css = fs.readFileSync('src/App.css', 'utf8');

// 1. Remove the bad block I added
const badBlock = `.premium-nav-desktop {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1 1 auto;
  justify-content: center;
  flex-wrap: wrap;
}
.premium-logout-desktop {
  display: block;
  margin-left: 0.5rem;
}
.premium-header-right {
  display: none; /* Hide mobile right-block on desktop */
}`;
css = css.replace(badBlock, '');

// 2. Remove the bad mobile overrides I added
const badMobileOverrides = `
  .premium-nav-desktop {
    display: none !important;
  }
  .premium-logout-desktop {
    display: none !important;
  }
  .premium-header-right {
    display: flex !important;
    align-items: center;
    position: static;
  }
`;
css = css.replace(badMobileOverrides, '');

// 3. Set up the exact flex orders for desktop
// Left is already flex: 0 0 auto or flex: 1. Let's enforce order.
css = css.replace(
  /\.premium-header-left\s*\{/, 
  `.premium-header-left {\n  order: 1;`
);

// Right (contains Nav Links) becomes order 2 and flexes to fill space
css = css.replace(
  /\.premium-header-right\s*\{\s*display:\s*flex;/, 
  `.premium-header-right {\n  display: flex;\n  order: 2;\n  justify-content: center;\n  flex: 1 1 auto;`
);

// Center (contains Profile/Bell) becomes order 3
css = css.replace(
  /\.premium-header-center\s*\{\s*display:\s*flex;/, 
  `.premium-header-center {\n  display: flex;\n  order: 3;`
);

// 4. Ensure .premium-header-inner has flex-wrap: wrap to allow responsive compression
css = css.replace(
  /\.premium-header-inner\s*\{[\s\S]*?padding: 12px 1.5rem;[\s\S]*?\}/,
  `.premium-header-inner {
  width: 100%;
  padding: 12px 1.5rem;
  min-height: 5rem;
  height: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1920px;
  margin-left: auto;
  margin-right: auto;
  flex-wrap: wrap;
  gap: 16px;
}`
);

fs.writeFileSync('src/App.css', css);
console.log('App.css cleaned and desktop flex order applied.');
