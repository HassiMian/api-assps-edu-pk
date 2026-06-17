import QRCode from "qrcode";
import bwipjs from "bwip-js";
import { customAlphabet } from "nanoid";
import fs from "fs/promises";
import path from "path";
import { getPool } from "@/lib/server/db";

const nanoid = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 8);

export type GenerateIdentityInput = {
  schoolId: number;
  tenantId?: string | null;
  studentId: string;
  admissionNo?: string | null;
  rollNo?: string | null;
};

function getUploadDir(schoolId: number) {
  return path.join(process.cwd(), "public", "uploads", "identity", String(schoolId));
}

function getPublicUrl(schoolId: number, fileName: string) {
  return `/uploads/identity/${schoolId}/${fileName}`;
}

async function ensureStudentIdentityColumns() {
  await getPool().query(`
    ALTER TABLE students
      ADD COLUMN IF NOT EXISTS identity_code TEXT UNIQUE,
      ADD COLUMN IF NOT EXISTS qr_payload TEXT,
      ADD COLUMN IF NOT EXISTS qr_image_url TEXT,
      ADD COLUMN IF NOT EXISTS barcode_value TEXT,
      ADD COLUMN IF NOT EXISTS barcode_image_url TEXT;
  `);
}

export async function generateUniqueIdentityCode(schoolId: number) {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const candidate = `ID-${schoolId}-${nanoid()}`;
    const result = await getPool().query(
      `SELECT 1 FROM students WHERE identity_code = $1 LIMIT 1`,
      [candidate]
    );
    if (result.rowCount === 0) {
      return candidate;
    }
  }

  throw new Error("Could not generate a unique identity code");
}

export async function generateStudentIdentityAssets(input: GenerateIdentityInput) {
  await ensureStudentIdentityColumns();

  const uploadDir = getUploadDir(input.schoolId);
  await fs.mkdir(uploadDir, { recursive: true });

  const params: Array<string | number> = [input.studentId, input.schoolId];
  let tenantPredicate = "";

  if (input.tenantId) {
    params.push(input.tenantId);
    tenantPredicate = ` OR tenant_id = $${params.length}`;
  }

  const studentResult = await getPool().query(
    `SELECT *
     FROM students
     WHERE id = $1
       AND (school_id = $2${tenantPredicate})
     LIMIT 1`,
    params
  );

  const student = studentResult.rows[0];
  if (!student) {
    throw new Error("Student not found");
  }

  const identityCode =
    student.identity_code || (await generateUniqueIdentityCode(input.schoolId));

  const admissionNo =
    student.admission_no || input.admissionNo || student.gr_number || null;
  const rollNo = student.roll_no || input.rollNo || null;

  const qrPayload = JSON.stringify({
    type: "student_identity",
    schoolId: input.schoolId,
    studentId: input.studentId,
    identityCode,
    fullName: student.name || student.full_name || null,
    admissionNo,
    rollNo,
    issuedAt: new Date().toISOString(),
  });

  const barcodeValue = student.barcode_value || identityCode;

  const qrFileName = `qr-${input.studentId}-${identityCode}.png`;
  const barcodeFileName = `barcode-${input.studentId}-${identityCode}.png`;
  const qrPath = path.join(uploadDir, qrFileName);
  const barcodePath = path.join(uploadDir, barcodeFileName);

  const qrBuffer = await QRCode.toBuffer(qrPayload, {
    type: "png",
    width: 280,
    margin: 1,
    color: { dark: "#000000", light: "#ffffff" },
  });

  const barcodeBuffer = await bwipjs.toBuffer({
    bcid: "code128",
    text: barcodeValue,
    scale: 3,
    height: 80,
    includetext: true,
    textxalign: "center",
    backgroundcolor: "FFFFFF",
    textsize: 14,
  });

  await Promise.all([
    fs.writeFile(qrPath, qrBuffer),
    fs.writeFile(barcodePath, barcodeBuffer),
  ]);

  const qrImageUrl = getPublicUrl(input.schoolId, qrFileName);
  const barcodeImageUrl = getPublicUrl(input.schoolId, barcodeFileName);

  const updateResult = await getPool().query(
    `UPDATE students
       SET identity_code = $1,
           qr_payload = $2,
           qr_image_url = $3,
           barcode_value = $4,
           barcode_image_url = $5
       WHERE id = $6
         AND school_id = $7
       RETURNING *`,
    [
      identityCode,
      qrPayload,
      qrImageUrl,
      barcodeValue,
      barcodeImageUrl,
      input.studentId,
      input.schoolId,
    ]
  );

  if (updateResult.rowCount === 0) {
    throw new Error("Student not found or access denied");
  }

  return {
    identityCode,
    qrPayload,
    qrImageUrl,
    barcodeValue,
    barcodeImageUrl,
    student: updateResult.rows[0],
  };
}
