import path from "path";
import fs from "fs/promises";
import { v4 as uuid } from "uuid";

export type ApexLeadInput = {
  type: "demo" | "contact" | "register" | "enterprise";
  name: string;
  email: string;
  phone: string;
  schoolName?: string;
  city?: string;
  studentsCount?: string;
  notes?: string;
  extra?: Record<string, string>;
};

export type ApexLeadStatus = "new" | "contacted" | "archived";

export type ApexLeadRecord = ApexLeadInput & {
  leadId: string;
  status: ApexLeadStatus;
  created_at: string;
  updated_at?: string;
};

function leadsDir() {
  return path.join(process.cwd(), "data", "apex-leads");
}

export async function createApexLead(input: ApexLeadInput) {
  const leadId = `LEAD-${uuid().slice(0, 8).toUpperCase()}`;
  const record: ApexLeadRecord = {
    ...input,
    leadId,
    status: "new",
    created_at: new Date().toISOString(),
  };

  await fs.mkdir(leadsDir(), { recursive: true });
  await fs.writeFile(path.join(leadsDir(), `${leadId}.json`), JSON.stringify(record, null, 2), "utf8");
  return record;
}

export async function listApexLeads(statusParam?: string | null) {
  const dir = leadsDir();
  try {
    const files = await fs.readdir(dir);
    const items: ApexLeadRecord[] = [];

    for (const file of files) {
      if (!file.endsWith(".json")) continue;
      try {
        const raw = await fs.readFile(path.join(dir, file), "utf8");
        items.push(JSON.parse(raw) as ApexLeadRecord);
      } catch {
        // skip corrupt file
      }
    }

    const wanted = String(statusParam || "ALL").toLowerCase();
    const filtered =
      wanted === "all"
        ? items
        : items.filter((item) => String(item.status || "new").toLowerCase() === wanted);

    return filtered.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  } catch {
    return [];
  }
}

export async function updateApexLeadStatus(leadId: string, status: ApexLeadStatus) {
  const filePath = path.join(leadsDir(), `${leadId}.json`);
  const raw = await fs.readFile(filePath, "utf8");
  const data = JSON.parse(raw) as ApexLeadRecord;
  const next: ApexLeadRecord = {
    ...data,
    status,
    updated_at: new Date().toISOString(),
  };
  await fs.writeFile(filePath, JSON.stringify(next, null, 2), "utf8");
  return next;
}
