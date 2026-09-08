const fs = require('fs');

let css = fs.readFileSync('src/App.css', 'utf8');

css = css.replace(
  /\.premium-header-inner\s*\{[\s\S]*?-ms-overflow-style:\s*none;\s*\}/,
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

css = css.replace(
  /\.premium-header-left\s*\{[\s\S]*?gap:\s*0\.75rem;\s*\}/,
  `.premium-header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  order: 1;
  flex: 0 0 auto;
}`
);

css = css.replace(
  /\.premium-header-right\s*\{[\s\S]*?gap:\s*0\.75rem;\s*\}/,
  `.premium-header-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  order: 2;
  flex: 1 1 auto;
  justify-content: flex-end;
  min-width: 0;
}`
);

css = css.replace(
  /\.premium-header-center\s*\{[\s\S]*?gap:\s*0\.75rem;\s*\}/,
  `.premium-header-center {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  order: 3;
  flex: 0 0 auto;
}`
);

css = css.replace(
  /\.premium-nav-links\s*\{[\s\S]*?padding-left:\s*0\.5rem;\s*\}/,
  `.premium-nav-links {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding-left: 0.5rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}`
);

fs.writeFileSync('src/App.css', css);
console.log('App.css updated with responsive layout.');
