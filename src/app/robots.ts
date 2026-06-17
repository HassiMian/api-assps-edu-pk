import type { MetadataRoute } from "next";
import { DOMAINS } from "@/lib/platform";

export default function robots(): MetadataRoute.Robots {
  const base = `https://${DOMAINS.website}`;
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/apex", "/apex/"],
        disallow: ["/saas-admin/", "/admin/", "/api/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
