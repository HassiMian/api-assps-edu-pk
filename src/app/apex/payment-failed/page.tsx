import PaymentStatusPage from "../PaymentStatusPage";

export const metadata = { title: "Payment Failed | APEX" };

export default function Page() {
  return <PaymentStatusPage status="failed" />;
}
