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

  // Pattern 1: >${Number...  (JSX expression after literal dollar)
  content = content.replace(/>\$\{/g, '>₹{');
  content = content.replace(/>-\$\{/g, '>-₹{');
  content = content.replace(/>\+\$\{/g, '>+₹{');
  
  // Pattern 2: PDF Text components
  content = content.replace(/<Text>\$\{/g, '<Text>₹{');
  content = content.replace(/<Text>-\$\{/g, '<Text>-₹{');
  content = content.replace(/<Text>\+\$\{/g, '<Text>+₹{');
  content = content.replace(/<Text style=\{[^\}]+\}>\$\{/g, match => match.replace('>${', '>₹{'));
  content = content.replace(/<Text style=\{[^\}]+\}>-\$\{/g, match => match.replace('>-${', '>-₹{'));
  
  // Pattern 3: Template literals representing currency (not JSX text node)
  // e.g. `$${Number(tax.value).toFixed(2)}`
  content = content.replace(/\$\$\{/g, '₹${');
  
  // Pattern 4: space $ {
  content = content.replace(/ \$\{/g, ' ₹{');
  content = content.replace(/ x \$\{/g, ' x ₹{');

  // Pattern 5: specific labels
  content = content.replace(/\(\$\)/g, '(₹)');

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log('Updated:', file);
  }
});
