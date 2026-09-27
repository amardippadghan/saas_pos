const fs = require('fs');
let file = './apps/web/src/app/dashboard/pos/components/ProductGrid.tsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/transition-all ₹\{/g, 'transition-all ${');
fs.writeFileSync(file, content);
