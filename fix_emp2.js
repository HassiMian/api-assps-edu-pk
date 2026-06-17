const fs = require('fs');
const file = 'C:/projects/My SAas/super-app/src/app/admin/employees/page.tsx';
let data = fs.readFileSync(file, 'utf8');

const correctCode = `import api from '@/utils/api';
import {
  GraduationCap, Search, Plus, X, Edit2, Trash2, Mail, Phone,
  BookOpen, AlertTriangle, CheckCircle2, Loader2, Filter, Download
} from 'lucide-react';

interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  status: 'active' | 'inactive' | 'on_leave';
  joinDate: string;
  salary: number;
}

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);`;

data = data.replace(
  /import \{ useState, useEffect \} from 'react';\r?\n  const \[search, setSearch\] = useState\(""\);/,
  "import { useState, useEffect } from 'react';\n" + correctCode + "\n  const [search, setSearch] = useState(\"\");"
);
fs.writeFileSync(file, data);
