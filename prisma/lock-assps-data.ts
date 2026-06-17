import { Pool } from "pg";
import fs from "fs";
import path from "path";

function loadEnv() {
  const paths = [
    path.join(__dirname, "../.env"),
    path.join(__dirname, "../../.env"),
    "/var/www/apex-backend/.env",
    "/var/www/apex-connect/.env",
    path.join(process.cwd(), ".env"),
  ];

  for (const p of paths) {
    if (fs.existsSync(p)) {
      console.log(`Found environment file at ${p}`);
      const content = fs.readFileSync(p, "utf8");
      content.split("\n").forEach((line) => {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
          const key = match[1];
          let value = match[2] || "";
          if (value.startsWith('"') && value.endsWith('"')) {
            value = value.substring(1, value.length - 1);
          } else if (value.startsWith("'") && value.endsWith("'")) {
            value = value.substring(1, value.length - 1);
          }
          process.env[key] = value.trim();
        }
      });
      break;
    }
  }
}

// Load env variables
loadEnv();

function env(name: string, fallback: string): string {
  const value = process.env[name];
  return value && value.trim() ? value.trim() : fallback;
}

const pool = new Pool({
  host: env("DB_HOST", "127.0.0.1"),
  port: Number(env("DB_PORT", "5432")),
  database: env("DB_NAME", "alsiddique_db"),
  user: env("DB_USER", "postgres"),
  password: env("DB_PASSWORD", "admin123"),
});

const ASSPS_EMAIL = "admin@assps.edu.pk";
const ASSPS_NAME = "AL SIDDIQUE SCHOLARS PUBLIC SCHOOL";

async function main() {
  console.log(`Connecting to database [${env("DB_NAME", "alsiddique_db")}] to lock existing data...`);

  // 1. Provision ASSPS Core School Tenant
  const schoolCheck = await pool.query(
    "SELECT id, tenant_id FROM schools WHERE LOWER(email) = LOWER($1) LIMIT 1",
    [ASSPS_EMAIL]
  );

  let schoolId: number;
  let tenantId = "al-siddique";

  if (schoolCheck.rows.length === 0) {
    const schoolInsert = await pool.query(
      `INSERT INTO schools (
        name, code, tenant_id, school_name, email, phone, address, status, type
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'active', 'REAL')
      RETURNING id, tenant_id`,
      [
        ASSPS_NAME,
        tenantId,
        tenantId,
        ASSPS_NAME,
        ASSPS_EMAIL,
        "03000000000",
        "Sharif Chowk, Rayya Khas, Narowal",
      ]
    );
    schoolId = schoolInsert.rows[0].id;
    tenantId = schoolInsert.rows[0].tenant_id;
    console.log(`Created core ASSPS tenant (ID: ${schoolId}, Code: ${tenantId})`);
  } else {
    schoolId = schoolCheck.rows[0].id;
    tenantId = schoolCheck.rows[0].tenant_id || tenantId;
    await pool.query(
      `UPDATE schools 
       SET name = $1, school_name = $1, status = 'active', type = 'REAL' 
       WHERE id = $2`,
      [ASSPS_NAME, schoolId]
    );
    console.log(`Located core ASSPS tenant (ID: ${schoolId}, Code: ${tenantId})`);
  }

  // 2. Discover all tables that have school_id or tenant_id columns
  const columnsRes = await pool.query(`
    SELECT table_name, column_name 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND column_name IN ('school_id', 'tenant_id')
      AND table_name NOT IN ('schools')
  `);

  console.log(`Discovered ${columnsRes.rows.length} schema mappings containing tenant fields.`);

  // Group columns by table_name
  const tables: Record<string, string[]> = {};
  columnsRes.rows.forEach((row) => {
    if (!tables[row.table_name]) {
      tables[row.table_name] = [];
    }
    tables[row.table_name].push(row.column_name);
  });

  // 3. Systematically lock unassigned rows in discovered tables
  for (const tableName of Object.keys(tables)) {
    const columns = tables[tableName];

    if (columns.includes("school_id")) {
      const updateSchoolRes = await pool.query(
        `UPDATE "${tableName}" 
         SET school_id = $1 
         WHERE school_id IS NULL`,
        [schoolId]
      );
      const schoolRows = updateSchoolRes.rowCount ?? 0;
      if (schoolRows > 0) {
        console.log(`Locked ${schoolRows} rows in [${tableName}] to school_id: ${schoolId}`);
      }
    }

    if (columns.includes("tenant_id")) {
      const updateTenantRes = await pool.query(
        `UPDATE "${tableName}" 
         SET tenant_id = $1 
         WHERE tenant_id IS NULL OR tenant_id = ''`,
        [tenantId]
      );
      const tenantRows = updateTenantRes.rowCount ?? 0;
      if (tenantRows > 0) {
        console.log(`Locked ${tenantRows} rows in [${tableName}] to tenant_id: ${tenantId}`);
      }
    }
  }

  console.log("\n==========================================");
  console.log("🎉 Historical data locked to ASSPS Tenant successfully!");
  console.log("ASSPS Tenant ID:", schoolId);
  console.log("ASSPS Code:", tenantId);
  console.log("==========================================\n");
}

main()
  .catch((err) => {
    console.error("Migration failed:", err.message || err);
    process.exit(1);
  })
  .finally(() => pool.end());
