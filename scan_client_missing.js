const fs = require('fs');
const path = require('path');
function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const res = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(res) : [res];
  });
}
const root = path.join(__dirname, 'src');
const hooks = ['useState','useEffect','useMemo','useCallback','useContext','useRef','createContext','motion','AnimatePresence','useRouter','next/navigation'];
for (const file of walk(root)) {
  if (!file.match(/\.tsx?$/)) continue;
  const text = fs.readFileSync(file, 'utf8');
  if (hooks.some((k) => text.includes(k))) {
    const first = text.split(/\r?\n/).find((l) => l.trim().length);
    const hasClient = first && (first.trim() === '"use client";' || first.trim() === "'use client';");
    if (!hasClient) console.log(file.replace(__dirname + path.sep, ''));
  }
}
