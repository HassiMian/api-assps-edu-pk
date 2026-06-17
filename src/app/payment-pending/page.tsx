import PaymentStatusPage from "../apex/PaymentStatusPage";

export const metadata = { title: "Payment Pending | APEX" };

export default function Page() {
  return <PaymentStatusPage status="pending" />;
}
