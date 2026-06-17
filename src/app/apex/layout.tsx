import type { Metadata } from "next";
import { apexGatewayMetadata } from "./apexSeo";

export const metadata: Metadata = {
  ...apexGatewayMetadata,
  title: {
    default: "APEX Education OS",
    template: "%s | APEX",
  },
};

export default function ApexMarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
