const fs = require('fs');
let css = fs.readFileSync('src/App.css', 'utf8');
css = css.replace(/\{ b padding: 0;/g, '{ border: 0; padding: 0;');
fs.writeFileSync('src/App.css', css);
console.log('App.css syntax error fixed.');
