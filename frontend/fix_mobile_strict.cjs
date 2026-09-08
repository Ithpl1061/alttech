const fs = require('fs');
let css = fs.readFileSync('src/App.css', 'utf8');

const mobileSafetyReset = `
  /* ABSOLUTE MOBILE SAFETY OVERRIDES */
  .premium-header-inner {
    flex-wrap: nowrap !important;
    min-height: 0 !important;
    height: 4rem !important;
    padding: 8px 12px !important;
  }
  .premium-header-left {
    order: 1 !important;
    flex: 1 1 auto !important;
  }
  .premium-header-center {
    order: 2 !important;
    flex: 0 0 auto !important;
  }
  .premium-header-right {
    order: 3 !important;
    flex: 0 0 auto !important;
  }
  .premium-nav-links {
    display: none !important; /* Force hide on mobile until opened */
  }
  .premium-nav-links.mobile-open {
    display: flex !important; /* Allow it to open */
  }
`;

// Insert it right after @media (max-width: 768px) {
// Replace any previous bad mobile overrides I might have left
css = css.replace(/@media \(max-width: 768px\) \{([\s\S]*?\.premium-header-left \{ order: 1 !important; \}[\s\S]*?\.premium-header-right \{ order: 3 !important; \})/, '@media (max-width: 768px) {');

css = css.replace(/@media \(max-width: 768px\) \{/, '@media (max-width: 768px) {\n' + mobileSafetyReset);

fs.writeFileSync('src/App.css', css);
console.log('App.css mobile layout protected with absolute strict overrides.');
