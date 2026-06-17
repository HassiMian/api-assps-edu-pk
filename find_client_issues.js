const fs = require('fs');
const path = require('path');
const glob = require('glob');
const patterns = ['src/components/**/*.{tsx,jsx}', 'src/app/**/*.{tsx,jsx}'];
const keywords = ['useState', 'useEffect', 'useMemo', 'useCallback', 'useContext', 'useRef', 'createPortal', 'motion', 'AnimatePresence', 'next/navigation'];
let count = 0;
for (const pattern of patterns) {
  const files = glob.sync(pattern, { nodir: true, ignore: ['**/node_modules/**'] });
  for (const file of files) {
    const text = fs.readFileSync(path.join(__dirname, file), 'utf8');
    const firstLine = text.split(/\r?\n/).find(l => l.trim().length > 0) || '';
    const hasClient = firstLine.trim() === '"use client";' || firstLine.trim() === "'use client';";
    const usesKeyword = keywords.some(k => text.includes(k));
    if (usesKeyword && !hasClient) {
      console.log(file);
      count++;
    }
  }
}
console.log(`\nTotal files missing use client: ${count}`);
