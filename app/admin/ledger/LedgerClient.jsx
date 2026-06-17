"use client";
import { useState, useTransition } from "react";
import { PlusCircle, TrendingUp, TrendingDown, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const CATEGORIES = ["Medical", "Food", "Grocery", "Education", "Orphanage", "Admin", "Other"];
const EMPTY = { type: "credit", amount: "", note: "", category: "Food", reference_type: "donation" };

export default function LedgerClient({ entries: initial, totalCredits, totalDebits }) {
  const [entries,  setEntries]  = useState(initial);
  const [credits,  setCredits]  = useState(totalCredits);
  const [debits,   setDebits]   = useState(totalDebits);
  const [modal,    setModal]    = useState(false);
  const [form,     setForm]     = useState(EMPTY);
  const [filter,   setFilter]   = useState("all");
  const [isPending, start]      = useTransition();
  const supabase = createClient();

  const filtered = filter === "all" ? entries : entries.filter(e => e.type === filter);
  const balance  = credits - debits;

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleAdd = async () => {
    if (!form.amount || !form.note) { toast.error("Amount and note are required."); return; }
    start(async () => {
      const { data, error } = await supabase.from("ledger_entries").insert({
        type: form.type, amount: Number(form.amount), note: form.note,
        category: form.category, reference_type: form.reference_type,
      }).select().single();
      if (error) { toast.error(error.message); return; }
      setEntries(prev => [data, ...prev]);
      if (data.type === "credit") setCredits(c => c + Number(data.amount));
      else                        setDebits(d => d + Number(data.amount));
      setModal(false);
      setForm(EMPTY);
      toast.success("Ledger entry added.");
    });
  };

  return (
    <div className="p-6 md:p-10 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-headline text-headline-lg text-primary">Ledger / Finance</h1>
          <p className="text-body-md text-on-surface-variant">Internal fund tracking — never exposed publicly</p>
        </div>
        <button onClick={() => setModal(true)} className="btn-primary"><PlusCircle className="w-4 h-4" /> Add Entry</button>
      </div>

      {/* Balance summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-gutter">
        {[
          { label: "Total Credits (Donations)", val: credits, Icon: TrendingUp, color: "text-secondary bg-secondary-fixed" },
          { label: "Total Debits (Expenses)",   val: debits,  Icon: TrendingDown, color: "text-on-error-container bg-error-container" },
          { label: "Net Balance",               val: balance, Icon: null,         color: balance >= 0 ? "text-secondary bg-primary-fixed" : "text-on-error-container bg-error-container" },
        ].map(({ label, val, Icon, color }) => (
          <div key={label} className="stat-card flex items-center gap-4">
            {Icon && <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}><Icon className="w-6 h-6" /></div>}
            <div>
              <p className="font-headline font-bold text-headline-md text-primary">
                {val < 0 ? "-" : ""}₹{Math.abs(val).toLocaleString("en-IN")}
              </p>
              <p className="text-caption text-on-surface-variant mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {["all","credit","debit"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-label-md capitalize transition-all ${filter === f ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"}`}>
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-body-md">
            <thead className="bg-surface-container-low text-label-md text-on-surface-variant uppercase tracking-wider">
              <tr>
                {["Type","Amount","Note","Category","Ref Type","Date"].map(h => (
                  <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-on-surface-variant">No entries yet.</td></tr>
              ) : filtered.map(e => (
                <tr key={e.id} className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="px-4 py-3">
                    <span className={`badge capitalize ${e.type === "credit" ? "badge-approved" : "badge-rejected"}`}>
                      {e.type === "credit" ? "↑ Credit" : "↓ Debit"}
                    </span>
                  </td>
                  <td className={`px-4 py-3 font-headline font-bold whitespace-nowrap ${e.type === "credit" ? "text-secondary" : "text-on-error-container"}`}>
                    ₹{Number(e.amount).toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-3 text-on-surface">{e.note}</td>
                  <td className="px-4 py-3 text-on-surface-variant capitalize">{e.category}</td>
                  <td className="px-4 py-3 text-on-surface-variant capitalize">{e.reference_type || "—"}</td>
                  <td className="px-4 py-3 text-on-surface-variant whitespace-nowrap text-sm">
                    {new Date(e.created_at).toLocaleDateString("en-IN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-primary/60 z-50 flex items-center justify-center p-4" onClick={() => setModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="font-headline text-headline-md text-primary">Add Ledger Entry</h2>
              <button onClick={() => setModal(false)}><X className="w-5 h-5 text-on-surface-variant" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="form-label">Type</label>
                <div className="flex gap-3">
                  {["credit","debit"].map(t => (
                    <button key={t} type="button" onClick={() => setForm(f => ({ ...f, type: t }))}
                      className={`flex-1 py-3 rounded-lg text-label-md capitalize border-2 transition-all ${form.type === t ? "bg-primary text-on-primary border-primary" : "border-outline-variant text-on-surface-variant"}`}>
                      {t === "credit" ? "↑ Credit" : "↓ Debit"}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="form-label">Amount (₹) *</label>
                <input name="amount" type="number" onWheel={e => e.target.blur()} className="form-input" value={form.amount} onChange={handleChange} />
              </div>
              <div>
                <label className="form-label">Note *</label>
                <input name="note" className="form-input" value={form.note} onChange={handleChange} placeholder="e.g. Food distribution expense - Jan 2025" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Category</label>
                  <select name="category" className="form-input" value={form.category} onChange={handleChange}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Reference Type</label>
                  <select name="reference_type" className="form-input" value={form.reference_type} onChange={handleChange}>
                    {["donation","expense","transfer","other"].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setModal(false)} className="flex-1 py-3 border border-outline-variant rounded-lg text-on-surface-variant">Cancel</button>
              <button onClick={handleAdd} disabled={isPending} className="btn-primary flex-1 justify-center disabled:opacity-60">
                {isPending ? "Adding..." : "Add Entry"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
