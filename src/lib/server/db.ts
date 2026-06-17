import { Pool } from "pg";
import { getDbConfig } from "./env";

let pool: Pool | null = null;

export function getPool() {
  if (!pool) {
    const cfg = getDbConfig();
    pool = new Pool({
      host: cfg.host,
      port: cfg.port,
      database: cfg.database,
      user: cfg.user,
      password: cfg.password,
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 3000,
    });
  }
  return pool;
}
