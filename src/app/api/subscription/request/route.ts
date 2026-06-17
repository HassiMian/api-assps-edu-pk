import { NextResponse } from "next/server";
import { saveUploadedFile } from "@/lib/server/upload-storage";
import { createSubscriptionRequest } from "@/lib/server/subscription-request-storage";
import { sendPaymentPendingEmail } from "@/lib/server/mail";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    let formData: FormData;
    try {
      formData = await req.formData();
    } catch {
      return NextResponse.json(
        { success: false, message: "Multipart form data is required" },
        { status: 400 }
      );
    }

    const planId = formData.get("planId") as string;
    const planName = formData.get("planName") as string;
    const planPrice = Number(formData.get("planPrice"));
    const ownerName = formData.get("ownerName") as string;
    const schoolName = formData.get("schoolName") as string;
    const schoolAddress = formData.get("schoolAddress") as string;
    const contactNumber = formData.get("contactNumber") as string;
    const email = formData.get("email") as string;
    const city = (formData.get("city") as string) || "";
    const billingCycle = (formData.get("billingCycle") as string) || "monthly";
    const paymentMethod = (formData.get("paymentMethod") as string) || "manual";
    const transactionId = (formData.get("transactionId") as string) || "";
    const screenshot = formData.get("paymentScreenshot") as File | null;

    if (
      !planId ||
      !planName ||
      !planPrice ||
      !ownerName ||
      !schoolName ||
      !schoolAddress ||
      !contactNumber ||
      !email
    ) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    let uploadedScreenshotUrl: string | undefined;
    if (screenshot && screenshot.size > 0) {
      const uploaded = await saveUploadedFile({
        file: screenshot,
        folder: "payment-screenshots",
      });
      uploadedScreenshotUrl = uploaded.url;
    }

    const request = await createSubscriptionRequest({
      planId,
      planName,
      planPrice,
      ownerName,
      schoolName,
      schoolAddress,
      contactNumber,
      email,
      city,
      billingCycle,
      paymentMethod,
      transactionId,
      paymentScreenshotUrl: uploadedScreenshotUrl,
    });

    const requestId = request.request_id;
    try {
      await sendPaymentPendingEmail({
        to: email,
        ownerName,
        schoolName,
        requestId,
        planName,
        amount: Math.round(planPrice),
      });
    } catch (emailErr) {
      console.warn("[subscription] pending email failed:", emailErr);
    }

    return NextResponse.json({
      success: true,
      message: "Subscription request submitted successfully",
      data: request,
      requestId,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to submit request";
    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 }
    );
  }
}
