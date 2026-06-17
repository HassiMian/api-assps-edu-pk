import nodemailer from "nodemailer";

export async function sendEmail({ to, subject, html }) {
  const missingConfig = !process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS;

  if (missingConfig) {
    console.log("SMTP is not configured. Email skipped:", { to, subject });
    return { skipped: true };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || "APEX Support <support@apex.pk>",
    to,
    subject,
    html,
  });

  return { skipped: false };
}
