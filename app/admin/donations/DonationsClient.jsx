"use client";
import { useState, useTransition } from "react";
import { CheckCircle, XCircle, ExternalLink, Search, Filter } from "lucide-react";
import { toast } from "sonner";

const FILTERS = ["all", "pending", "approved", "rejected"];

export default function DonationsClient({ donations: initial }) {
  const [donations, setDonations] = useState(initial);
  const [filter, setFilter]       = useState("pending");
  const [search, setSearch]       = useState("");
  const [selected, setSelected]   = useState(null);
  const [rejectReason, setReason] = useState("");
  const [isPending, startTransition] = useTransition();

  const filtered = donations
    .filter(d => filter === "all" || d.status === filter)
    .filter(d => {
      const q = search.toLowerCase();
      return !q || d.donor_name?.toLowerCase().includes(q) || d.email?.toLowerCase().includes(q) || d.transaction_ref?.includes(q);
    });

  const handleApprove = async (donation) => {
    startTransition(async () => {
      try {
        const res = await fetch("/api/donate/approve", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: donation.id, action: "approve" }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setDonations(prev => prev.map(d => d.id === donation.id ? { ...d, status: "approved" } : d));
        setSelected(null);
        toast.success(`Donation by ${donation.donor_name} approved! Receipt email sent.`);
      } catch (err) { toast.error(err.message); }
    });
  };

  const handleReject = async (donation) => {
    if (!rejectReason.trim()) { toast.error("Please provide a rejection reason."); return; }
    startTransition(async () => {
      try {
        const res = await fetch("/api/donate/approve", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: donation.id, action: "reject", reason: rejectReason }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setDonations(prev => prev.map(d => d.id === donation.id ? { ...d, status: "rejected", rejection_reason: rejectReason } : d));
        setSelected(null);
        setReason("");
        toast.success("Donation rejected.");
      } catch (err) { toast.error(err.message); }
    });
  };

  const STATUS_BADGE = {
    pending:  "badge-pending",
    approved: "badge-approved",
    rejected: "badge-rejected",
  };

  return (
    <div className="p-6 md:p-10 space-y-6">
      <div>
        <h1 className="font-headline text-headline-lg text-primary">Donation Management</h1>
        <p className="text-body-md text-on-surface-variant mt-1">Review, approve, and manage all incoming donations</p>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
          <input
            className="form-input pl-10" placeholder="Search by name, email, or ref..."
            value={search} onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-label-md capitalize transition-all ${
                filter === f ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
              }`}>
              {f}
              <span className="ml-2 text-xs">
                ({f === "all" ? donations.length : donations.filter(d => d.status === f).length})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-body-md">
            <thead className="bg-surface-container-low text-label-md text-on-surface-variant uppercase tracking-wider">
              <tr>
                {["Donor", "Amount", "Reference", "Campaign", "Date", "Status", "Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-on-surface-variant">No donations found.</td></tr>
              ) : filtered.map(d => (
                <tr key={d.id} className="hover:bg-surface-container-low/50 transition-colors cursor-pointer"
                  onClick={() => setSelected(d)}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-on-surface">{d.donor_name}</p>
                    <p className="text-caption text-on-surface-variant">{d.email}</p>
                    {d.is_anonymous && <span className="badge bg-surface-container text-on-surface-variant text-xs mt-1">Anonymous</span>}
                  </td>
                  <td className="px-4 py-3 font-headline font-semibold text-secondary whitespace-nowrap">
                    ₹{Number(d.final_amount || d.amount).toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-3 font-mono text-sm text-on-surface-variant">{d.transaction_ref || "—"}</td>
                  <td className="px-4 py-3 text-sm text-on-surface-variant">{d.campaigns?.title || d.campaign_id || "—"}</td>
                  <td className="px-4 py-3 text-sm text-on-surface-variant whitespace-nowrap">
                    {new Date(d.created_at).toLocaleDateString("en-IN")}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${STATUS_BADGE[d.status] || "badge-pending"} capitalize`}>{d.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    {d.status === "pending" && (
                      <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                        <button onClick={() => handleApprove(d)} disabled={isPending}
                          className="p-2 rounded-lg bg-primary-fixed text-on-primary-fixed hover:opacity-80 transition-opacity">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button onClick={() => { setSelected(d); setReason(""); }} disabled={isPending}
                          className="p-2 rounded-lg bg-error-container text-on-error-container hover:opacity-80 transition-opacity">
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-primary/60 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 space-y-4" onClick={e => e.stopPropagation()}>
            <h2 className="font-headline text-headline-md text-primary">Donation Details</h2>
            <dl className="space-y-3 text-body-md">
              {[
                ["Donor",     selected.donor_name],
                ["Email",     selected.email],
                ["Phone",     selected.phone || "—"],
                ["Amount",    `₹${Number(selected.final_amount || selected.amount).toLocaleString("en-IN")}`],
                ["Reference", selected.transaction_ref || "—"],
                ["Message",   selected.comment || "—"],
                ["Date",      new Date(selected.created_at).toLocaleString("en-IN")],
              ].map(([k, v]) => (
                <div key={k} className="flex gap-4">
                  <dt className="text-on-surface-variant w-24 flex-shrink-0">{k}</dt>
                  <dd className="text-on-surface font-medium">{v}</dd>
                </div>
              ))}
              {selected.proof_link && (
                <div className="flex gap-4">
                  <dt className="text-on-surface-variant w-24">Proof</dt>
                  <dd><a href={selected.proof_link} target="_blank" rel="noopener noreferrer"
                    className="text-secondary flex items-center gap-1 hover:underline">
                    View Screenshot <ExternalLink className="w-3 h-3" />
                  </a></dd>
                </div>
              )}
            </dl>

            {selected.status === "pending" && (
              <>
                <div className="pt-2">
                  <label className="form-label">Rejection Reason (required to reject)</label>
                  <input className="form-input" value={rejectReason}
                    onChange={e => setReason(e.target.value)}
                    placeholder="e.g. Reference not found, screenshot unclear..." />
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => handleApprove(selected)} disabled={isPending}
                    className="btn-primary flex-1 justify-center">
                    ✓ Approve & Email Donor
                  </button>
                  <button onClick={() => handleReject(selected)} disabled={isPending}
                    className="flex-1 bg-error-container text-on-error-container px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity">
                    ✗ Reject
                  </button>
                </div>
              </>
            )}
            <button onClick={() => setSelected(null)}
              className="w-full text-center text-on-surface-variant text-label-md hover:text-on-surface mt-2">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
