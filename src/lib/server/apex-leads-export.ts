import { listApexLeads } from "@/lib/server/apex-leads-storage";

function escapeCsv(value: unknown) {
  const text = String(value ?? "");
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export async function buildApexLeadsCsv(statusParam: string | null) {
  const leads = await listApexLeads(statusParam);
  const headers = [
    "Lead ID",
    "Type",
    "Status",
    "Name",
    "Email",
    "Phone",
    "School",
    "City",
    "Students",
    "Notes",
    "Created",
  ];

  const rows = leads.map((item) =>
    [
      item.leadId,
      item.type,
      item.status,
      item.name,
      item.email,
      item.phone,
      item.schoolName || "",
      item.city || "",
      item.studentsCount || "",
      item.notes || "",
      item.created_at,
    ]
      .map(escapeCsv)
      .join(",")
  );

  return [headers.join(","), ...rows].join("\n");
}
