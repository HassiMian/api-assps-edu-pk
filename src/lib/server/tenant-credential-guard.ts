import { getPool } from "@/lib/server/db";

async function hasColumn(tableName: string, columnName: string) {
  const result = await getPool().query(
    `SELECT 1
     FROM information_schema.columns
     WHERE table_schema = 'public'
       AND table_name = $1
       AND column_name = $2
     LIMIT 1`,
    [tableName, columnName]
  );

  return (result.rowCount ?? 0) > 0;
}

export async function validateSameTenantOrThrow({
  tenantId,
  studentId,
  parentId,
}: {
  tenantId: string;
  studentId?: string | number;
  parentId?: string | number;
}) {
  if (!tenantId) {
    throw new Error("Tenant ID is required");
  }

  if (studentId && await hasColumn("students", "tenant_id")) {
    const student = await getPool().query(
      `SELECT id
       FROM students
       WHERE id = $1
         AND tenant_id = $2
       LIMIT 1`,
      [studentId, tenantId]
    );

    if ((student.rowCount ?? 0) === 0) {
      throw new Error("Student does not belong to this tenant");
    }
  }

  if (parentId && await hasColumn("users", "tenant_id")) {
    const parent = await getPool().query(
      `SELECT id
       FROM users
       WHERE id = $1
         AND tenant_id = $2
         AND LOWER(role) = 'parent'
       LIMIT 1`,
      [parentId, tenantId]
    );

    if ((parent.rowCount ?? 0) === 0) {
      throw new Error("Parent does not belong to this tenant");
    }
  }

  return true;
}
