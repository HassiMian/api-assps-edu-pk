import type { MetadataRoute } from "next";
import { DOMAINS } from "@/lib/platform";

const BASE = `https://${DOMAINS.website}`;

const MARKETING_PATHS = [
  "",
  "/apex",
  "/apex/features",
  "/apex/pricing",
  "/apex/demo-request",
  "/apex/contact",
  "/apex/enterprise",
  "/apex/register-school",
  "/apex/checkout",
  "/apex/privacy-policy",
  "/apex/terms",
  "/apex/refund-policy",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return MARKETING_PATHS.map((path) => ({
    url: `${BASE}${path}`,
    lastModified: now,
    changeFrequency: path === "" || path === "/apex" ? "weekly" : "monthly",
    priority: path === "" || path === "/apex" ? 1 : 0.7,
  }));
}
