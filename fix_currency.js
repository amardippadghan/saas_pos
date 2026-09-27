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

  // JSX text nodes: >$ -> >₹
  content = content.replace(/>\$/g, '>₹');
  content = content.replace(/>-\$/g, '>-₹');
  content = content.replace(/>\+\$/g, '>+₹');
  
  // Template literals where it's `$${something}` -> `₹${something}`
  content = content.replace(/\$\$\{/g, '₹${');
  
  // Also instances like `-$${something}` -> `-₹${something}`
  content = content.replace(/-\$\$\{/g, '-₹${');
  content = content.replace(/\+\$\$\{/g, '+₹${');

  // Hardcoded strings like "$"
  content = content.replace(/'\$'/g, "'₹'");
  content = content.replace(/"\$"/g, '"₹"');
  
  // PDF Text with style
  content = content.replace(/<Text>\$/g, '<Text>₹');
  content = content.replace(/<Text>-\$/g, '<Text>-₹');
  content = content.replace(/<Text>\+\$/g, '<Text>+₹');

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log('Updated:', file);
  }
});
