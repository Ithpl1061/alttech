const fs = require('fs');
let css = fs.readFileSync('src/App.css', 'utf8');
css = css.replace(/;\s*b\s*}/g, ';}');
css = css.replace(/;\s*b\s+/g, '; ');
css = css.replace(/\{\s*b\s+/g, '{ ');
fs.writeFileSync('src/App.css', css);
console.log('App.css syntax error fixed globally.');
