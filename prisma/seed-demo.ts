import { Pool } from "pg";
import bcrypt from "bcryptjs";
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

// Load custom env
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

async function main() {
  console.log(`Connecting to database [${env("DB_NAME", "alsiddique_db")}] as [${env("DB_USER", "postgres")}] on [${env("DB_HOST", "127.0.0.1")}]...`);

  // 1. Ensure schema support for school type
  await pool.query(`
    ALTER TABLE schools ADD COLUMN IF NOT EXISTS type VARCHAR(20) DEFAULT 'REAL';
    ALTER TABLE schools ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';
  `).catch((err) => {
    console.warn("Schema alteration warning during demo seed:", err.message);
  });

  const passwordHash = await bcrypt.hash("Demo@123456", 12);
  const email = "demo@apex.edu.pk";

  // 2. Upsert school tenant for demo
  const schoolCheckRes = await pool.query(
    "SELECT id, tenant_id FROM schools WHERE LOWER(email) = LOWER($1) LIMIT 1",
    [email]
  );

  let schoolId: number;
  let tenantId = "apex-demo-school";

  if (schoolCheckRes.rows.length === 0) {
    const schoolInsert = await pool.query(
      `INSERT INTO schools (
        name, code, tenant_id, school_name, email, phone, address, status, type
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'active', 'DEMO')
      RETURNING id, tenant_id`,
      [
        "APEX Demo School",
        tenantId,
        tenantId,
        "APEX Demo School",
        email,
        "03000000000",
        "Demo Campus",
      ]
    );
    schoolId = schoolInsert.rows[0].id;
    tenantId = schoolInsert.rows[0].tenant_id;
    console.log(`Created demo school tenant record (ID: ${schoolId}, Code: ${tenantId})`);
  } else {
    schoolId = schoolCheckRes.rows[0].id;
    tenantId = schoolCheckRes.rows[0].tenant_id || tenantId;
    await pool.query(
      "UPDATE schools SET type = 'DEMO', status = 'active', name = $2, school_name = $2 WHERE id = $1",
      [schoolId, "APEX Demo School"]
    );
    console.log(`Updated existing demo school tenant record (ID: ${schoolId}, Code: ${tenantId})`);
  }

  // 3. Upsert default settings for demo school
  const settingsCheck = await pool.query(
    "SELECT id FROM settings WHERE school_id = $1 LIMIT 1",
    [schoolId]
  );
  if (settingsCheck.rows.length === 0) {
    await pool.query(
      `INSERT INTO settings (
        school_id, school_name, school_address, school_phone, school_email, principal_name, branding_config
      ) VALUES ($1, $2, $3, $4, $5, $6, '{}'::jsonb)`,
      [
        schoolId,
        "APEX Demo School",
        "Demo Campus",
        "03000000000",
        email,
        "Demo Admin",
      ]
    );
  }

  // 4. Upsert school admin user for demo
  const userCheckRes = await pool.query(
    "SELECT id FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1",
    [email]
  );

  if (userCheckRes.rows.length === 0) {
    const userInsert = await pool.query(
      `INSERT INTO users (
        school_id, tenant_id, name, email, password, role, designation, is_active, username, permissions, must_change_password
      ) VALUES ($1, $2, $3, $4, $5, 'school_admin', 'Principal', true, 'demo', '[]'::jsonb, false)
      RETURNING id`,
      [schoolId, tenantId, "Demo Admin", email, passwordHash]
    );
    console.log(`Created demo admin user (ID: ${userInsert.rows[0].id})`);
  } else {
    const userId = userCheckRes.rows[0].id;
    await pool.query(
      `UPDATE users 
       SET school_id = $1, tenant_id = $2, name = 'Demo Admin', password = $3, role = 'school_admin', is_active = true, must_change_password = false
       WHERE id = $4`,
      [schoolId, tenantId, passwordHash, userId]
    );
    console.log(`Updated existing demo admin user credentials (ID: ${userId})`);
  }

  console.log("\n==========================================");
  console.log("🎉 APEX Demo Account Seeding Complete!");
  console.log("Email:    demo@apex.edu.pk");
  console.log("Password: Demo@123456");
  console.log("Mode:     DEMO");
  console.log("==========================================\n");
}

main()
  .catch((err) => {
    console.error("Demo seeding failed with error:", err.message || err);
  })
  .finally(() => pool.end());
