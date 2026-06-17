import { NextResponse } from "next/server";
import { saveUploadedFile } from "@/lib/server/upload-storage";
import { withTenant } from "@/lib/server/tenant-guard";
import { upsertTenantBrandingLogo } from "@/lib/server/tenant-branding-storage";

export const runtime = "nodejs";

export async function POST(req: Request) {
  return withTenant(async ({ tenantId }) => {
    if (!tenantId) {
      return NextResponse.json(
        { success: false, message: "Tenant access missing" },
        { status: 403 }
      );
    }

    let formData: FormData;
    try {
      formData = await req.formData();
    } catch {
      return NextResponse.json(
        { success: false, message: "Multipart form data is required" },
        { status: 400 }
      );
    }

    const logo = formData.get("logo") as File | null;

    if (!logo) {
      return NextResponse.json(
        { success: false, message: "Logo file is required" },
        { status: 400 }
      );
    }

    const uploaded = await saveUploadedFile({
      file: logo,
      folder: "branding",
    });

    const branding = await upsertTenantBrandingLogo({
      tenantId,
      logoUrl: uploaded.url,
    });

    return NextResponse.json({
      success: true,
      message: "Branding logo uploaded successfully",
      data: branding,
      upload: uploaded,
    });
  });
}
