import crypto from "crypto";
import bcrypt from "bcryptjs";
import { sendEmail } from "@/lib/sendEmail";

export function createTenantId(schoolName) {
  const slug = String(schoolName || "school")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const random = crypto.randomBytes(3).toString("hex");

  return `${slug || "school"}-${random}`;
}

export function generateTemporaryPassword() {
  const part1 = crypto.randomBytes(3).toString("hex").toUpperCase();
  const part2 = crypto.randomBytes(3).toString("hex").toUpperCase();

  return `APX-${part1}-${part2}`;
}

export async function generateSchoolAdminCredentials({
  request,
  tenantId,
  schoolId,
  prismaClient,
}) {
  if (!request?.email) {
    throw new Error("Request email is required");
  }

  const temporaryPassword = generateTemporaryPassword();
  const passwordHash = await bcrypt.hash(temporaryPassword, 12);
  let user;

  if (prismaClient?.user) {
    const existingUser = await prismaClient.user.findUnique({
      where: {
        email: request.email,
      },
    });

    if (existingUser) {
      throw new Error("Email is already used by another user");
    }

    user = await prismaClient.user.create({
      data: {
        tenantId,
        schoolId,
        name: request.ownerName,
        email: request.email,
        password: passwordHash,
        role: "SCHOOL_ADMIN",
        status: "ACTIVE",
        mustChangePassword: true,
      },
    });
  } else {
    user = {
      id: `user_${crypto.randomBytes(4).toString("hex")}`,
      tenantId,
      schoolId,
      name: request.ownerName,
      email: request.email,
      role: "SCHOOL_ADMIN",
      status: "ACTIVE",
      mustChangePassword: true,
      passwordHashGenerated: Boolean(passwordHash),
    };
  }

  const emailResult = await sendCredentialsEmail({
    to: request.email,
    ownerName: request.ownerName,
    schoolName: request.schoolName,
    email: request.email,
    password: temporaryPassword,
  });

  return {
    user,
    temporaryPassword,
    passwordHashGenerated: Boolean(passwordHash),
    emailSent: !emailResult?.skipped,
  };
}

export async function sendCredentialsEmail({
  to,
  ownerName,
  schoolName,
  email,
  password,
}) {
  const loginUrl =
    process.env.NEXT_PUBLIC_SAAS_LOGIN_URL || "https://app.assps.edu.pk/login";

  return sendEmail({
    to,
    subject: "Your APEX School Account Has Been Activated",
    html: `
      <div style="font-family:Arial,sans-serif;background:#f8fafc;padding:24px;">
        <div style="max-width:640px;margin:auto;background:white;border-radius:18px;padding:28px;border:1px solid #e2e8f0;">
          <h2 style="color:#020617;margin-bottom:8px;">Welcome to APEX</h2>
          <p style="color:#475569;">Dear ${ownerName},</p>

          <p style="color:#334155;line-height:1.7;">
            Your APEX subscription has been approved and your school account is now active.
          </p>

          <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:14px;padding:18px;margin:20px 0;">
            <p><b>School:</b> ${schoolName}</p>
            <p><b>Login URL:</b> <a href="${loginUrl}">${loginUrl}</a></p>
            <p><b>Email:</b> ${email}</p>
            <p><b>Temporary Password:</b> ${password}</p>
          </div>

          <p style="color:#334155;line-height:1.7;">
            Please login and change your password immediately after first login.
          </p>

          <p style="color:#64748b;font-size:14px;">
            Need help? Contact APEX WhatsApp Support.
          </p>

          <p style="margin-top:24px;color:#020617;">
            Regards,<br/>
            <b>APEX Support Team</b>
          </p>
        </div>
      </div>
    `,
  });
}
