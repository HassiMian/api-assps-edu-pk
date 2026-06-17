import ApexGatewayCinematic from "./ApexGatewayCinematic";
import ApexJsonLd from "./ApexJsonLd";
import ApexAnalytics from "./ApexAnalytics";
import { apexGatewayMetadata } from "./apexSeo";
import "./apex.module.css";

export const metadata = apexGatewayMetadata;

export default function ApexGatewayPage() {
  return (
    <>
      <ApexJsonLd />
      <ApexAnalytics />
      <ApexGatewayCinematic />
    </>
  );
}
