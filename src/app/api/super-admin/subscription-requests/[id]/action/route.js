import { NextResponse } from "next/server";
import crypto from "crypto";
import { sendEmail } from "@/lib/sendEmail";
import { requireSaasAdminUser } from "@/lib/server/auth-user";
import {
  createTenantId,
  generateSchoolAdminCredentials,
} from "@/lib/apexCredentials";

const demoRequests = [
  {
    id: "REQ-001",
    schoolName: "ABC Public School",
    schoolAddress: "Main Road, Lahore",
    ownerName: "Muhammad Ali",
    email: "abcschool@gmail.com",
    contactNumber: "03001234567",
    selectedPlan: "Professional",
    billingCycle: "monthly",
    status: "pending",
  },
  {
    id: "REQ-002",
    schoolName: "The Smart School",
    schoolAddress: "Model Town, Lahore",
    ownerName: "Ahmed Khan",
    email: "smart@gmail.com",
    contactNumber: "03112223344",
    selectedPlan: "Starter",
    billingCycle: "monthly",
    status: "pending",
  },
];

export async function POST(req, context) {
  try {
    await requireSaasAdminUser();

    const params = await context.params;
    const id = String(params?.id || "");
    const body = await req.json();
    const { action, rejectionReason } = body;

    const request = demoRequests.find((item) => item.id.toLowerCase() === id.toLowerCase());

    if (!request) {
      return NextResponse.json(
        { success: false, message: "Subscription request not found" },
        { status: 404 }
      );
    }

    if (request.status !== "pending") {
      return NextResponse.json(
        { success: false, message: "Request already processed" },
        { status: 400 }
      );
    }

    if (action === "reject") {
      const reason = rejectionReason || "Payment verification failed";

      await sendEmail({
        to: request.email,
        subject: "APEX Subscription Request Rejected",
        html: `
          <h2>APEX Subscription Request Rejected</h2>
          <p>Dear ${request.ownerName},</p>
          <p>Your subscription request for <b>${request.schoolName}</b> has been rejected.</p>
          <p><b>Reason:</b> ${reason}</p>
          <p>Please contact APEX Support for help.</p>
        `,
      });

      return NextResponse.json({
        success: true,
        message: "Request rejected successfully",
        data: {
          requestId: request.id,
          status: "rejected",
          rejectionReason: reason,
          emailSent: Boolean(process.env.SMTP_HOST),
        },
      });
    }

    if (action !== "approve") {
      return NextResponse.json(
        { success: false, message: "Invalid action" },
        { status: 400 }
      );
    }

    const tenantId = createTenantId(request.schoolName);
    const schoolId = `school_${crypto.randomBytes(4).toString("hex")}`;
    const { user, passwordHashGenerated, emailSent } = await generateSchoolAdminCredentials({
      request,
      tenantId,
      schoolId,
    });

    return NextResponse.json({
      success: true,
      message: "Request approved, tenant created, credentials emailed",
      schoolId,
      tenantId,
      adminUserId: user.id,
      emailSent,
      backendReady: {
        passwordHashGenerated,
        mustChangePassword: user.mustChangePassword,
        nextPersistenceSteps: [
          "create school record",
          "create school_admin user",
          "save subscription",
          "save invoice",
          "mark request approved",
        ],
      },
    });
  } catch (error) {
    if (error?.message === "Unauthorized" || error?.message === "Forbidden") {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.message === "Forbidden" ? 403 : 401 }
      );
    }

    console.error("Subscription action error:", error);

    return NextResponse.json(
      { success: false, message: "Server error while processing request" },
      { status: 500 }
    );
  }
}
