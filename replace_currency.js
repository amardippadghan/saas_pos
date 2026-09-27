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

let totalReplaced = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Replace >$
  content = content.replace(/>\$/g, '>₹');
  // Replace >-$
  content = content.replace(/>-\$/g, '>-₹');
  // Replace >+$
  content = content.replace(/>\+\$/g, '>+₹');
  // Replace ${Number
  content = content.replace(/\$\{Number/g, '₹{Number');
  // Replace -${Number
  content = content.replace(/-\$\{Number/g, '-₹{Number');
  // Replace +${Number
  content = content.replace(/\+\$\{Number/g, '+₹{Number');
  // Replace $ followed by number e.g. $10
  content = content.replace(/\$([0-9])/g, '₹$1');
  // Replace -$ followed by number
  content = content.replace(/-\$([0-9])/g, '-₹$1');
  
  // Specific fix for PDF Text components
  content = content.replace(/<Text>\$/g, '<Text>₹');
  content = content.replace(/<Text>-\$/g, '<Text>-₹');
  content = content.replace(/<Text>\+\$/g, '<Text>+₹');
  content = content.replace(/<Text style=\{[^\}]+\}>\$/g, match => match.replace('>$', '>₹'));
  content = content.replace(/<Text style=\{[^\}]+\}>-\$/g, match => match.replace('>-$', '>-₹'));
  
  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log('Updated:', file);
    totalReplaced++;
  }
});

console.log('Total files updated:', totalReplaced);
