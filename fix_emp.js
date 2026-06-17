const fs = require('fs');
const file = 'C:/projects/My SAas/super-app/src/app/admin/employees/page.tsx';
let data = fs.readFileSync(file, 'utf8');

data = data.replace(/department: string;\n  designation: string;\n  status: 'active' \| 'inactive' \| 'on_leave';\n  joinDate: string;\n  salary: number;\n  department: string;/g, 
  "department: string;\n  designation: string;\n  status: 'active' | 'inactive' | 'on_leave';\n  joinDate: string;\n  salary: number;");

data = data.replace(
  /setEmployees\(res\.data\.data\);/g,
  `setEmployees(res.data.data.map((e: any) => ({
          ...e,
          status: e.is_active ? 'active' : 'inactive',
          joinDate: e.join_date ? new Date(e.join_date).toISOString().split('T')[0] : ''
        })));`
);

data = data.replace(/, department: \['.*?'\]/g, '');
data = data.replace(/<th className="p-4 font-medium">Classes<\/th>/g, '');
data = data.replace(
  /<td className="p-4">\s*<div className="flex flex-wrap gap-1">\s*\{employee\.classes\.map\(\(c, i\) => \(\s*<span key=\{i\} className="text-xs px-2 py-0\.5 rounded-md bg-slate-700\/50 text-slate-300">\{c\}<\/span>\s*\)\)\}\s*<\/div>\s*<\/td>/g,
  ''
);
data = data.replace(/classes: \[\]/g, '');
data = data.replace(/, department: \[\]/g, '');

data = data.replace(
  /const res = await api\.put\(`\/employees\/\$\{editingEmployee\.id\}`,\s*formData\);/g,
  `const payload = {
          ...formData,
          is_active: formData.status === 'active',
          join_date: formData.joinDate
        };
        const res = await api.put(\`/employees/\${editingEmployee.id}\`, payload);`
);

data = data.replace(
  /const res = await api\.post\('\/employees', formData\);/g,
  `const payload = {
          ...formData,
          is_active: formData.status === 'active',
          join_date: formData.joinDate
        };
        const res = await api.post('/employees', payload);`
);

data = data.replace(/<th className="p-4 font-medium">Subject<\/th>/g, '<th className="p-4 font-medium">Department</th>');
data = data.replace(/<label className="block text-sm text-slate-400 mb-1">Subject<\/label>/g, '<label className="block text-sm text-slate-400 mb-1">Department</label>');

fs.writeFileSync(file, data);
console.log('Script done');
