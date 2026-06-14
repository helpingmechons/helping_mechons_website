"use client";
import { useState, useTransition } from "react";
import { Users, Shield, User, CheckCircle, Clock, MailCheck, MailX } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function UsersClient({ profiles: initial }) {
  const [profiles, setProfiles] = useState(initial);
  const [search, setSearch]     = useState("");
  const [isPending, start]      = useTransition();
  const supabase = createClient();

  const filtered = profiles.filter(p => {
    const q = search.toLowerCase();
    return !q ||
      (p.full_name || "").toLowerCase().includes(q) ||
      (p.email || "").toLowerCase().includes(q);
  });

  const handleRoleToggle = async (profile) => {
    const newRole = profile.role === "admin" ? "donor" : "admin";
    if (newRole === "admin" && !confirm(`Elevate ${profile.full_name || profile.email} to admin? They will have full access to the admin portal.`)) return;
    start(async () => {
      const { data, error } = await supabase.from("profiles").update({ role: newRole }).eq("id", profile.id).select().single();
      if (error) { toast.error(error.message); return; }
      setProfiles(prev => prev.map(p => p.id === data.id ? { ...p, role: data.role } : p));
      toast.success(`Role updated to ${newRole}.`);
    });
  };

  const confirmedCount = profiles.filter(p => p.email_confirmed).length;
  const adminCount     = profiles.filter(p => p.role === "admin").length;

  return (
    <div className="p-6 md:p-10 space-y-6">
      <div>
        <h1 className="font-headline text-headline-lg text-primary">Users</h1>
        <p className="text-body-md text-on-surface-variant">
          Only email-confirmed accounts appear here.
        </p>
      </div>

      {/* Stats */}
      <div className="flex flex-wrap gap-4">
        <div className="stat-card flex items-center gap-4 pr-8">
          <div className="w-12 h-12 bg-primary-fixed rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6 text-on-primary-fixed" />
          </div>
          <div>
            <p className="font-headline font-bold text-headline-md text-primary">{profiles.length}</p>
            <p className="text-caption text-on-surface-variant">Total Users</p>
          </div>
        </div>
        <div className="stat-card flex items-center gap-4 pr-8">
          <div className="w-12 h-12 bg-secondary-fixed rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-on-secondary-fixed" />
          </div>
          <div>
            <p className="font-headline font-bold text-headline-md text-primary">{adminCount}</p>
            <p className="text-caption text-on-surface-variant">Admins</p>
          </div>
        </div>
        <div className="stat-card flex items-center gap-4 pr-8">
          <div className="w-12 h-12 bg-tertiary-fixed rounded-xl flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-on-tertiary-fixed" />
          </div>
          <div>
            <p className="font-headline font-bold text-headline-md text-primary">{confirmedCount}</p>
            <p className="text-caption text-on-surface-variant">Confirmed</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <input
        className="form-input max-w-sm"
        placeholder="Search by name or email..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-body-md">
            <thead className="bg-surface-container-low text-label-md text-on-surface-variant uppercase tracking-wider">
              <tr>
                {["User", "Email", "Status", "Role", "Joined", "Last Login", "Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-on-surface-variant">No users found.</td>
                </tr>
              )}
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                        p.role === "admin" ? "bg-secondary text-on-secondary" : "bg-primary-fixed text-on-primary-fixed"
                      }`}>
                        {(p.full_name || p.email || "?")?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-on-surface">{p.full_name || "(No name)"}</p>
                        <p className="text-caption text-on-surface-variant font-mono">{p.id.slice(0, 8)}…</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-on-surface-variant text-sm">{p.email || "—"}</td>
                  <td className="px-4 py-3">
                    {p.email_confirmed ? (
                      <span className="flex items-center gap-1 text-caption text-secondary font-semibold">
                        <MailCheck className="w-3.5 h-3.5" /> Confirmed
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-caption text-on-surface-variant">
                        <MailX className="w-3.5 h-3.5" /> Pending
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge capitalize ${p.role === "admin" ? "bg-secondary text-on-secondary" : "badge-pending"}`}>
                      {p.role === "admin" ? <Shield className="w-3 h-3 inline mr-1" /> : <User className="w-3 h-3 inline mr-1" />}
                      {p.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-on-surface-variant text-sm whitespace-nowrap">
                    {new Date(p.created_at).toLocaleDateString("en-IN")}
                  </td>
                  <td className="px-4 py-3 text-on-surface-variant text-sm whitespace-nowrap">
                    {p.last_sign_in
                      ? new Date(p.last_sign_in).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
                      : "Never"}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleRoleToggle(p)}
                      disabled={isPending}
                      className={`px-3 py-1.5 rounded-lg text-caption font-semibold transition-colors disabled:opacity-50 ${
                        p.role === "admin"
                          ? "bg-error-container text-on-error-container hover:opacity-80"
                          : "bg-primary-fixed text-on-primary-fixed hover:opacity-80"
                      }`}
                    >
                      {p.role === "admin" ? "Revoke Admin" : "Make Admin"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
