import { getPool } from "@/lib/server/db";
import { requireTenantUser } from "@/lib/server/auth-user";

const modelTableMap: Record<string, string> = {
  student: "students",
  parent: "users",
  teacher: "users",
  employee: "employees",
  attendance: "attendance",
  class: "classes",
  section: "sections",
  voucher: "challans",
  feeVoucher: "challans",
  fee: "challans",
  exam: "exams",
  result: "results",
  questionBank: "questions",
  question: "questions",
  paper: "papers",
  paperGenerator: "papers",
  identityCard: "students",
  timetable: "timetable",
  notification: "notifications",
  schoolSettings: "settings",
  setting: "settings",
};

const columnCache = new Map<string, Promise<boolean>>();

async function hasColumn(tableName: string, columnName: string) {
  const key = `${tableName}.${columnName}`;
  if (!columnCache.has(key)) {
    columnCache.set(
      key,
      getPool()
        .query(
          `SELECT 1
           FROM information_schema.columns
           WHERE table_schema = 'public'
             AND table_name = $1
             AND column_name = $2
           LIMIT 1`,
          [tableName, columnName]
        )
        .then((result) => Number(result.rowCount || 0) > 0)
    );
  }

  return columnCache.get(key)!;
}

async function addTenantScope({
  tableName,
  queryText,
  queryParams,
  user,
  tenantId,
}: {
  tableName: string;
  queryText: string;
  queryParams: any[];
  user: Awaited<ReturnType<typeof requireTenantUser>>;
  tenantId: string | null;
}) {
  const predicates: string[] = [];

  if (tenantId && (await hasColumn(tableName, "tenant_id"))) {
    queryParams.push(tenantId);
    predicates.push(`tenant_id = $${queryParams.length}`);
  }

  if (user.schoolId && (await hasColumn(tableName, "school_id"))) {
    queryParams.push(user.schoolId);
    predicates.push(`school_id = $${queryParams.length}`);
  }

  if (predicates.length === 0) {
    throw new Error(`Tenant scope columns missing for ${tableName}`);
  }

  queryText += queryText.toLowerCase().includes(" where ") ? " AND " : " WHERE ";
  queryText += `(${predicates.join(" OR ")})`;

  return queryText;
}

export async function getTenantScope() {
  const user = await requireTenantUser();

  if (user.role !== "SAAS_ADMIN" && !user.tenantId) {
    throw new Error("Tenant scope missing");
  }

  return {
    user,
    tenantId: user.tenantId,
    isSaasAdmin: user.role === "SAAS_ADMIN",
  };
}

export async function tenantFindMany<TModel extends string = any>({
  model,
  where = {},
}: {
  model: TModel;
  where?: any;
  orderBy?: any;
  include?: any;
}) {
  const { tenantId, isSaasAdmin, user } = await getTenantScope();
  const rawModel = String(model);
  const tableName = modelTableMap[rawModel] || `${rawModel}s`;
  const pool = getPool();

  let queryText = `SELECT * FROM "${tableName}"`;
  const queryParams: any[] = [];

  if (!isSaasAdmin) {
    queryText = await addTenantScope({
      tableName,
      queryText,
      queryParams,
      user,
      tenantId,
    });
  }

  // Handle simple filter keys in where object
  if (where && typeof where === "object") {
    const filterKeys = Object.keys(where);
    for (const key of filterKeys) {
      if (key === "tenantId" || key === "tenant_id") continue;
      const paramIndex = queryParams.length + 1;
      queryText += queryParams.length === 0 ? " WHERE " : " AND ";
      queryText += `"${key}" = $${paramIndex}`;
      queryParams.push(where[key]);
    }
  }

  const res = await pool.query(queryText, queryParams);
  return res.rows;
}

export async function tenantFindUnique<TModel extends string = any>({
  model,
  id,
}: {
  model: TModel;
  id: string | number;
  include?: any;
}) {
  const { tenantId, isSaasAdmin, user } = await getTenantScope();
  const rawModel = String(model);
  const tableName = modelTableMap[rawModel] || `${rawModel}s`;
  const pool = getPool();

  let queryText = `SELECT * FROM "${tableName}" WHERE id = $1`;
  const queryParams: any[] = [id];

  if (!isSaasAdmin) {
    queryText = await addTenantScope({
      tableName,
      queryText,
      queryParams,
      user,
      tenantId,
    });
  }

  queryText += ` LIMIT 1`;

  const res = await pool.query(queryText, queryParams);
  return res.rows[0] || null;
}

export async function tenantCreate<TModel extends string = any>({
  model,
  data,
}: {
  model: TModel;
  data: any;
}) {
  const { tenantId, user } = await getTenantScope();
  const rawModel = String(model);
  const tableName = modelTableMap[rawModel] || `${rawModel}s`;
  const pool = getPool();

  const insertData = { ...data, tenant_id: tenantId };
  if (user.schoolId) {
    insertData.school_id = insertData.school_id || user.schoolId;
  }
  // Clean camelCase tenantId if exists
  delete insertData.tenantId;

  const keys = Object.keys(insertData);
  const values = Object.values(insertData);

  const columnsStr = keys.map(k => `"${k}"`).join(", ");
  const placeholdersStr = keys.map((_, i) => `$${i + 1}`).join(", ");

  const queryText = `
    INSERT INTO "${tableName}" (${columnsStr})
    VALUES (${placeholdersStr})
    RETURNING *
  `;

  const res = await pool.query(queryText, values);
  return res.rows[0];
}

export async function tenantUpdate<TModel extends string = any>({
  model,
  id,
  data,
}: {
  model: TModel;
  id: string | number;
  data: any;
}) {
  const { tenantId, isSaasAdmin, user } = await getTenantScope();
  const rawModel = String(model);
  const tableName = modelTableMap[rawModel] || `${rawModel}s`;
  const pool = getPool();

  // First, verify access
  const existing = await tenantFindUnique({ model, id });
  if (!existing) {
    throw new Error("Record not found or access denied");
  }

  // Clear immutable values
  const updateData = { ...data };
  delete updateData.id;
  delete updateData.tenantId;
  delete updateData.tenant_id;

  const keys = Object.keys(updateData);
  const values = Object.values(updateData);

  if (keys.length === 0) {
    return existing;
  }

  const setStr = keys.map((k, i) => `"${k}" = $${i + 1}`).join(", ");
  const paramIndexId = values.length + 1;
  values.push(id);

  let queryText = `UPDATE "${tableName}" SET ${setStr} WHERE id = $${paramIndexId}`;

  if (!isSaasAdmin) {
    queryText = await addTenantScope({
      tableName,
      queryText,
      queryParams: values,
      user,
      tenantId,
    });
  }

  queryText += ` RETURNING *`;

  const res = await pool.query(queryText, values);
  return res.rows[0];
}

export async function tenantDelete<TModel extends string = any>({
  model,
  id,
}: {
  model: TModel;
  id: string | number;
}) {
  const { tenantId, isSaasAdmin, user } = await getTenantScope();
  const rawModel = String(model);
  const tableName = modelTableMap[rawModel] || `${rawModel}s`;
  const pool = getPool();

  // First, verify access
  const existing = await tenantFindUnique({ model, id });
  if (!existing) {
    throw new Error("Record not found or access denied");
  }

  let queryText = `DELETE FROM "${tableName}" WHERE id = $1`;
  const queryParams: any[] = [id];

  if (!isSaasAdmin) {
    queryText = await addTenantScope({
      tableName,
      queryText,
      queryParams,
      user,
      tenantId,
    });
  }

  await pool.query(queryText, queryParams);
  return { success: true };
}
