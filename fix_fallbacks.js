const fs = require('fs');

const filesToFix = [
  'C:/projects/My SAas/super-app/src/app/admin/ai-analytics/page.tsx',
  'C:/projects/My SAas/super-app/src/app/admin/announcements/page.tsx',
  'C:/projects/My SAas/super-app/src/app/admin/employees/page.tsx',
  'C:/projects/My SAas/super-app/src/app/admin/parents/page.tsx',
  'C:/projects/My SAas/super-app/src/app/admin/students/page.tsx'
];

for (const file of filesToFix) {
  let data = fs.readFileSync(file, 'utf8');
  data = data.replace(/set[A-Za-z]+\(getFallback[A-Za-z]+\(\)\);/g, 'console.error("API error");');
  fs.writeFileSync(file, data);
}
console.log('Fixed remaining getFallback calls.');
