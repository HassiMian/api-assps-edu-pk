import bcrypt from "bcryptjs";

export function generateTemporaryPassword() {
  return `Apex@${Math.floor(100000 + Math.random() * 900000)}`;
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}
