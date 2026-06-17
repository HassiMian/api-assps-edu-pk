import { listApexLeads } from "@/lib/server/apex-leads-storage";

export async function getApexLeadStats() {
  const all = await listApexLeads("ALL");

  const stats = {
    total: all.length,
    new: 0,
    contacted: 0,
    archived: 0,
    byType: {} as Record<string, number>,
  };

  for (const lead of all) {
    const status = String(lead.status || "new").toLowerCase();
    if (status === "new") stats.new += 1;
    if (status === "contacted") stats.contacted += 1;
    if (status === "archived") stats.archived += 1;

    const type = String(lead.type || "contact").toLowerCase();
    stats.byType[type] = (stats.byType[type] || 0) + 1;
  }

  return stats;
}
