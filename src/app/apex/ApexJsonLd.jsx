import { apexJsonLd } from "./apexSeo";

export default function ApexJsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(apexJsonLd()) }}
    />
  );
}
