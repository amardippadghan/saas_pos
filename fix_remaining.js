const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('./apps/web/src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // space dollar
  content = content.replace(/ x \$/g, ' x ₹');
  content = content.replace(/ \$/g, ' ₹');
  // Just in case I missed template literal with spaces
  content = content.replace(/ \$\$\{/g, ' ₹${');
  
  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log('Updated more:', file);
  }
});
