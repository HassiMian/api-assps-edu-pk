/** Server env helpers — no hardcoded secrets in production. */

export function envString(name: string, devFallback = ""): string {
  const value = process.env[name]?.trim();
  if (value) return value;
  if (process.env.NODE_ENV === "development") return devFallback;
  return "";
}

export function requireEnv(name: string, devFallback = ""): string {
  const value = envString(name, devFallback);
  if (!value && process.env.NODE_ENV === "production") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function getDbConfig() {
  return {
    host: envString("DB_HOST", "127.0.0.1"),
    port: Number(envString("DB_PORT", "5432")),
    database: envString("DB_NAME", "alsiddique_db"),
    user: envString("DB_USER", "postgres"),
    password: envString("DB_PASSWORD", process.env.NODE_ENV === "development" ? "admin123" : ""),
  };
}
