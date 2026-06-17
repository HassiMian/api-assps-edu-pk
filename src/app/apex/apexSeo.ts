import type { Metadata } from "next";
import { DOMAINS } from "@/lib/platform";

export const APEX_SITE_URL = `https://${DOMAINS.website}`;
export const APEX_OG_IMAGE = `${APEX_SITE_URL}/apex-logo-full.png`;

export const apexGatewayMetadata: Metadata = {
  title: "APEX Education OS | AI School Operating System",
  description:
    "Premium AI-powered school command center — academics, exams, fees, parent apps, analytics and multi-tenant SaaS for Pakistani schools.",
  metadataBase: new URL(APEX_SITE_URL),
  alternates: { canonical: APEX_SITE_URL },
  openGraph: {
    type: "website",
    url: APEX_SITE_URL,
    siteName: "APEX Education OS",
    title: "APEX Education OS | AI School Operating System",
    description:
      "One galaxy. Four worlds. APEX OS, Connect, Web and AI for modern school operations.",
    images: [{ url: APEX_OG_IMAGE, width: 892, height: 262, alt: "APEX Education OS" }],
    locale: "en_PK",
  },
  twitter: {
    card: "summary_large_image",
    title: "APEX Education OS",
    description: "AI-powered school operating system for academics, finance and parent engagement.",
    images: [APEX_OG_IMAGE],
  },
  robots: { index: true, follow: true },
};

export function apexJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: "APEX Education OS",
        url: APEX_SITE_URL,
        logo: `${APEX_SITE_URL}/apex-symbol.png`,
        email: "support@apex.assps.edu.pk",
        sameAs: [APEX_SITE_URL],
      },
      {
        "@type": "SoftwareApplication",
        name: "APEX Education OS",
        applicationCategory: "EducationalApplication",
        operatingSystem: "Web",
        offers: {
          "@type": "AggregateOffer",
          priceCurrency: "PKR",
          lowPrice: "4999",
          highPrice: "9999",
          offerCount: "3",
        },
        description:
          "School management SaaS with AI paper generator, parent apps, fees, exams and analytics.",
        url: APEX_SITE_URL,
      },
    ],
  };
}
