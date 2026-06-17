import PaymentStatusPage from "../apex/PaymentStatusPage";

export const metadata = { title: "Payment Failed | APEX" };

export default function Page() {
  return <PaymentStatusPage status="failed" />;
}
