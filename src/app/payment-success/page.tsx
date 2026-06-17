import PaymentStatusPage from "../apex/PaymentStatusPage";

export const metadata = { title: "Payment Success | APEX" };

export default function Page() {
  return <PaymentStatusPage status="success" />;
}
