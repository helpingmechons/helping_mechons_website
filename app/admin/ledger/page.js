import { createClient } from "@/lib/supabase/server";
import LedgerClient from "./LedgerClient";

export const metadata = { title: "Ledger / Finance" };

export default async function AdminLedgerPage() {
  const supabase = createClient();
  const { data: entries = [] } = await supabase
    .from("ledger_entries")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  const credits = entries.filter(e => e.type === "credit").reduce((s, e) => s + Number(e.amount), 0);
  const debits  = entries.filter(e => e.type === "debit").reduce((s,  e) => s + Number(e.amount), 0);

  return <LedgerClient entries={entries} totalCredits={credits} totalDebits={debits} />;
}
