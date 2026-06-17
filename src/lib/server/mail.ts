import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
  },
});

function logEmailFallback(label: string, content: string) {
  const logDir = path.join(process.cwd(), "logs");
  if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
  fs.appendFileSync(
    path.join(logDir, "email_fallbacks.log"),
    `\n=== ${label} ===\nTime: ${new Date().toISOString()}\n${content}\n============================\n`
  );
}

async function sendMail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const from = process.env.SMTP_FROM || `"APEX Support" <support@apex.assps.edu.pk>`;

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    logEmailFallback(subject, `To: ${to}\n${html.replace(/<[^>]+>/g, " ")}`);
    return false;
  }

  await transporter.sendMail({ from, to, subject, html });
  return true;
}

export async function sendSchoolCredentialsEmail({
  to,
  schoolName,
  ownerName,
  email,
  password,
}: {
  to: string;
  schoolName: string;
  ownerName: string;
  email: string;
  password: string;
}) {
  await sendMail({
    to,
    subject: `Your APEX School Account Credentials - ${schoolName}`,
    html: `
      <div style="font-family:Arial,sans-serif;background:#f8fafc;padding:30px;">
        <div style="max-width:620px;margin:auto;background:white;border-radius:18px;padding:28px;border:1px solid #e5e7eb;">
          <h1 style="color:#0f172a;margin:0;">Welcome to APEX</h1>
          <p style="color:#475569;">Dear ${ownerName},</p>
          <p>Your subscription request for <b>${schoolName}</b> has been approved.</p>
          <div style="background:#0f172a;color:white;border-radius:14px;padding:20px;margin:22px 0;">
            <p><b>Login Email:</b> ${email}</p>
            <p><b>Temporary Password:</b> ${password}</p>
          </div>
          <p>Please login and change your password on first login.</p>
          <p style="color:#64748b;font-size:13px;">APEX OS by AL SIDDIQUE SCHOLARS PUBLIC SCHOOL</p>
        </div>
      </div>
    `,
  });
}

export async function sendPaymentPendingEmail({
  to,
  ownerName,
  schoolName,
  requestId,
  planName,
  amount,
}: {
  to: string;
  ownerName: string;
  schoolName: string;
  requestId: string;
  planName: string;
  amount: number;
}) {
  await sendMail({
    to,
    subject: `APEX Payment Received — ${requestId}`,
    html: `
      <div style="font-family:Arial,sans-serif;padding:24px;">
        <h2 style="color:#0f172a;">Payment submitted successfully</h2>
        <p>Dear ${ownerName},</p>
        <p>We received your subscription payment proof for <b>${schoolName}</b>.</p>
        <p><b>Request ID:</b> ${requestId}<br/><b>Plan:</b> ${planName}<br/><b>Amount:</b> PKR ${amount.toLocaleString()}</p>
        <p>Our team will verify your payment within 24–48 hours. You will receive login credentials once approved.</p>
      </div>
    `,
  });
}

export async function sendPaymentRejectedEmail({
  to,
  ownerName,
  schoolName,
  requestId,
  reason,
}: {
  to: string;
  ownerName: string;
  schoolName: string;
  requestId: string;
  reason: string;
}) {
  await sendMail({
    to,
    subject: `APEX Payment Verification Update — ${requestId}`,
    html: `
      <div style="font-family:Arial,sans-serif;padding:24px;">
        <h2 style="color:#b91c1c;">Payment verification could not be completed</h2>
        <p>Dear ${ownerName},</p>
        <p>Your payment request for <b>${schoolName}</b> (${requestId}) was not approved.</p>
        <p><b>Reason:</b> ${reason}</p>
        <p>Please resubmit checkout with corrected transaction details or contact support.</p>
      </div>
    `,
  });
}

export async function sendPaymentConfirmedEmail({
  to,
  ownerName,
  schoolName,
  requestId,
  planName,
  amount,
  gateway,
  transactionId,
}: {
  to: string;
  ownerName: string;
  schoolName: string;
  requestId: string;
  planName: string;
  amount: number;
  gateway: string;
  transactionId?: string;
}) {
  await sendMail({
    to,
    subject: `APEX Payment Confirmed — ${requestId}`,
    html: `
      <div style="font-family:Arial,sans-serif;padding:24px;">
        <h2 style="color:#0f766e;">Payment confirmed via ${gateway}</h2>
        <p>Dear ${ownerName},</p>
        <p>Your ${gateway} payment for <b>${schoolName}</b> was received successfully.</p>
        <p><b>Request ID:</b> ${requestId}<br/><b>Plan:</b> ${planName}<br/><b>Amount:</b> PKR ${amount.toLocaleString()}</p>
        ${transactionId ? `<p><b>Transaction ID:</b> ${transactionId}</p>` : ""}
        <p>Our team will activate your school tenant shortly. You will receive login credentials by email once approved.</p>
      </div>
    `,
  });
}

export async function sendPaymentConfirmedAdminNotification({
  requestId,
  schoolName,
  ownerName,
  email,
  planName,
  amount,
  gateway,
  transactionId,
}: {
  requestId: string;
  schoolName: string;
  ownerName: string;
  email: string;
  planName: string;
  amount: number;
  gateway: string;
  transactionId?: string;
}) {
  const adminTo =
    process.env.APEX_PAYMENTS_NOTIFY_EMAIL ||
    process.env.APEX_LEADS_NOTIFY_EMAIL ||
    process.env.SMTP_USER ||
    "";

  if (!adminTo) {
    logEmailFallback("PAYMENT CONFIRMED", `${gateway} | ${requestId} | ${schoolName}`);
    return;
  }

  await sendMail({
    to: adminTo,
    subject: `APEX ${gateway} payment confirmed — ${requestId}`,
    html: `
      <div style="font-family:Arial,sans-serif;padding:24px;">
        <h2>Gateway payment confirmed</h2>
        <p><b>Gateway:</b> ${gateway}</p>
        <p><b>Request ID:</b> ${requestId}</p>
        <p><b>School:</b> ${schoolName}</p>
        <p><b>Owner:</b> ${ownerName} (${email})</p>
        <p><b>Plan:</b> ${planName} — PKR ${amount.toLocaleString()}</p>
        ${transactionId ? `<p><b>Transaction ID:</b> ${transactionId}</p>` : ""}
        <p>Status is <b>payment_confirmed</b>. Approve in SaaS Admin to activate tenant.</p>
      </div>
    `,
  });
}

export async function notifyPaymentConfirmed({
  requestId,
  ownerName,
  schoolName,
  email,
  planName,
  amount,
  gateway,
  transactionId,
}: {
  requestId: string;
  ownerName: string;
  schoolName: string;
  email: string;
  planName: string;
  amount: number;
  gateway: string;
  transactionId?: string;
}) {
  await Promise.allSettled([
    sendPaymentConfirmedEmail({
      to: email,
      ownerName,
      schoolName,
      requestId,
      planName,
      amount,
      gateway,
      transactionId,
    }),
    sendPaymentConfirmedAdminNotification({
      requestId,
      schoolName,
      ownerName,
      email,
      planName,
      amount,
      gateway,
      transactionId,
    }),
  ]);
}

const LEAD_TYPE_LABELS: Record<string, string> = {
  demo: "demo request",
  contact: "message",
  register: "school registration",
  enterprise: "enterprise inquiry",
};

export async function sendApexLeadAutoReply({
  to,
  name,
  type,
  leadId,
}: {
  to: string;
  name: string;
  type: string;
  leadId: string;
}) {
  const label = LEAD_TYPE_LABELS[type] || "request";

  return sendMail({
    to,
    subject: `APEX Education OS — we received your ${label}`,
    html: `
      <div style="font-family:Arial,sans-serif;background:#f8fafc;padding:30px;">
        <div style="max-width:620px;margin:auto;background:white;border-radius:18px;padding:28px;border:1px solid #e5e7eb;">
          <h1 style="color:#0f172a;margin:0 0 12px;">Thank you, ${name}</h1>
          <p style="color:#475569;line-height:1.6;">
            Your APEX ${label} has been received. Our team will respond within 24–48 hours.
          </p>
          <div style="background:#0f172a;color:white;border-radius:14px;padding:16px 20px;margin:22px 0;">
            <p style="margin:0;font-size:13px;opacity:0.8;">Reference ID</p>
            <p style="margin:6px 0 0;font-family:monospace;font-size:15px;">${leadId}</p>
          </div>
          <p style="color:#64748b;font-size:13px;">APEX Education OS · Al Siddique School System</p>
        </div>
      </div>
    `,
  });
}

export async function sendApexLeadNotification({
  leadId,
  type,
  name,
  email,
  phone,
  schoolName,
  notes,
}: {
  leadId: string;
  type: string;
  name: string;
  email: string;
  phone: string;
  schoolName?: string;
  notes?: string;
}) {
  const adminTo = process.env.APEX_LEADS_EMAIL || process.env.SMTP_USER || "";
  if (!adminTo) {
    logEmailFallback("APEX LEAD", `${type} | ${name} | ${email} | ${phone}`);
    return;
  }

  await sendMail({
    to: adminTo,
    subject: `New APEX ${type} lead — ${leadId}`,
    html: `
      <div style="font-family:Arial,sans-serif;padding:24px;">
        <h2>New ${type} request</h2>
        <p><b>ID:</b> ${leadId}</p>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Phone:</b> ${phone}</p>
        ${schoolName ? `<p><b>School:</b> ${schoolName}</p>` : ""}
        ${notes ? `<p><b>Notes:</b> ${notes}</p>` : ""}
      </div>
    `,
  });
}
