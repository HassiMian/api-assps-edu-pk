import { NextResponse } from "next/server";
import { saveUploadedFile } from "@/lib/server/upload-storage";
import { withTenant } from "@/lib/server/tenant-guard";
import {
  getTenantBranding,
  upsertTenantBranding,
} from "@/lib/server/tenant-branding-storage";

export const runtime = "nodejs";

function cleanColor(value: FormDataEntryValue | null) {
  const color = String(value || "").trim();
  return color || undefined;
}

export async function GET() {
  return withTenant(async ({ tenantId }) => {
    if (!tenantId) {
      return NextResponse.json(
        { success: false, message: "Tenant access missing" },
        { status: 403 }
      );
    }

    const branding = await getTenantBranding(tenantId);

    return NextResponse.json({
      success: true,
      data: branding,
    });
  });
}

export async function POST(req: Request) {
  return withTenant(async ({ tenantId }) => {
    if (!tenantId) {
      return NextResponse.json(
        { success: false, message: "Tenant access missing" },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const primaryColor = cleanColor(formData.get("primaryColor"));
    const secondaryColor = cleanColor(formData.get("secondaryColor"));
    const logo = formData.get("logo") as File | null;

    let logoUrl: string | undefined;

    if (logo && logo.size > 0) {
      const uploaded = await saveUploadedFile({
        file: logo,
        folder: "branding",
      });

      logoUrl = uploaded.url;
    }

    const branding = await upsertTenantBranding({
      tenantId,
      logoUrl,
      primaryColor,
      secondaryColor,
    });

    return NextResponse.json({
      success: true,
      message: "Branding updated successfully",
      data: branding,
    });
  });
}
