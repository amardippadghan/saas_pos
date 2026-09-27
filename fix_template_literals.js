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

  // We are looking for things like \`... ₹{... \`
  // A safer way is to just look at the exact occurrences we know broke.
  
  content = content.replace(/₹\{(tax.isActive|paymentMethod ===|razorpayEnabled|response.error|variant.name|item.productVariant)/g, '${$1');

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log('Fixed:', file);
  }
});
