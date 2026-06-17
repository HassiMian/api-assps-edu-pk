import path from "path";
import fs from "fs/promises";
import { v4 as uuid } from "uuid";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "application/pdf",
];

export async function saveUploadedFile({
  file,
  folder,
}: {
  file: File;
  folder: "branding" | "payment-screenshots";
}) {
  if (!file) throw new Error("File is required");

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error("Only PNG, JPG, JPEG, WEBP, or PDF files are allowed");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("File size must be under 5MB");
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const ext = file.name.split(".").pop()?.toLowerCase() || "png";
  const safeName = `${uuid()}.${ext}`;

  const uploadDir = path.join(process.cwd(), "public", "uploads", folder);
  await fs.mkdir(uploadDir, { recursive: true });

  const filePath = path.join(uploadDir, safeName);
  await fs.writeFile(filePath, buffer);

  return {
    fileName: safeName,
    url: `/uploads/${folder}/${safeName}`,
    size: file.size,
    type: file.type,
  };
}
