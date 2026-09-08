const fs = require('fs');
let css = fs.readFileSync('src/App.css', 'utf8');

// 1. Remove the old flex order hacks we applied previously since the DOM is now correctly ordered.
css = css.replace(/order:\s*\d+;/g, '');

// 2. Add styles for the new desktop navigation container
const desktopNavCss = `
.premium-nav-desktop {
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
}
`;

// Insert it somewhere safe, e.g., before the mobile media query
css = css.replace(/@media \(max-width: 768px\)/, desktopNavCss + '\n@media (max-width: 768px)');

// 3. Update the mobile media query to hide the desktop navigation and show the mobile right-block
const mobileOverrides = `
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

// Insert the mobile overrides right after the @media (max-width: 768px) {
css = css.replace(/@media \(max-width: 768px\) \{/, '@media (max-width: 768px) {\n' + mobileOverrides);

// 4. Update .premium-header-inner to use flex-wrap safely on desktop but not space it apart terribly
// Currently we have padding: 12px 1.5rem; justify-content: space-between;
// Since .premium-nav-desktop has flex: 1 and justify-content: center, it will naturally push Logo to left and Profile to right!
// This is exactly what the user wanted: balanced layout without too much empty space, grouped neatly!

fs.writeFileSync('src/App.css', css);
console.log('App.css updated for new semantic navbar DOM structure.');
