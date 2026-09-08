const fs = require('fs');

const content = fs.readFileSync('src/App.jsx', 'utf8');
const lines = content.split('\n');

// In App.jsx, createBlankReport was at lines 130-133 (0-indexed 129-132)
let insertIdx = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('function createBlankReport()')) {
    // The function spans a few lines. Find the line that has tests:
    for (let j = i + 1; j < lines.length; j++) {
      if (lines[j].includes('tests: [')) {
        insertIdx = j + 2; // tests is at j, `  }` is at j+1, we want to insert `}` at j+2
        break;
      }
    }
    break;
  }
}

if (insertIdx !== -1) {
  // Check if it's already there
  if (lines[insertIdx - 1].trim() === '}') {
      if (lines[insertIdx].trim() !== '}') {
          lines.splice(insertIdx, 0, '}');
      }
  } else {
     lines.splice(insertIdx, 0, '}');
  }
  
  fs.writeFileSync('src/App.jsx', lines.join('\n'));
  console.log("Fixed App.jsx by adding brace!");
} else {
  console.log("Could not find createBlankReport");
}
