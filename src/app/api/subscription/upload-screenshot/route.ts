import { NextResponse } from "next/server";
import { saveUploadedFile } from "@/lib/server/upload-storage";

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
    const screenshot = formData.get("screenshot") as File | null;

    if (!screenshot) {
      return NextResponse.json(
        { success: false, message: "Payment screenshot is required" },
        { status: 400 }
      );
    }

    const uploaded = await saveUploadedFile({
      file: screenshot,
      folder: "payment-screenshots",
    });

    return NextResponse.json({
      success: true,
      message: "Payment screenshot uploaded successfully",
      data: uploaded,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Screenshot upload failed";
    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: message.includes("required") || message.includes("allowed") || message.includes("5MB") ? 400 : 500 }
    );
  }
}
