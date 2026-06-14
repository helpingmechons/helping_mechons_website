"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Shield } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function AdminChangePasswordPage() {
  const [form, setForm]     = useState({ newPwd: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const router  = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPwd.length < 8) { toast.error("Password must be at least 8 characters."); return; }
    if (form.newPwd !== form.confirm) { toast.error("Passwords do not match."); return; }
    if (form.newPwd === "HelpingMechons@2026") { toast.error("You must choose a new password different from the default one."); return; }
    setLoading(true);
    const { error: pwError } = await supabase.auth.updateUser({ password: form.newPwd });
    if (pwError) { toast.error(pwError.message); setLoading(false); return; }
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("profiles").update({ must_change_password: false }).eq("id", user.id);
    toast.success("Password updated! Welcome to the admin portal.");
    router.push("/admin");
    router.refresh();
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full card p-10">
        <div className="w-14 h-14 bg-secondary rounded-xl flex items-center justify-center mx-auto mb-6">
          <Shield className="w-7 h-7 text-on-secondary" />
        </div>
        <h1 className="font-headline text-headline-md text-primary text-center mb-2">Set Your Admin Password</h1>
        <p className="text-body-md text-on-surface-variant text-center mb-8">
          For security, you must set a new password before accessing the admin portal. Choose a strong, unique password.
        </p>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="form-label flex items-center gap-2">
              <Lock className="w-4 h-4" /> New Password
            </label>
            <input type="password" required value={form.newPwd} placeholder="Min. 8 characters"
              onChange={e => setForm(f => ({ ...f, newPwd: e.target.value }))}
              className="form-input" />
          </div>
          <div>
            <label className="form-label">Confirm New Password</label>
            <input type="password" required value={form.confirm} placeholder="Repeat new password"
              onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
              className="form-input" />
          </div>
          <div className="p-4 bg-secondary-fixed/30 rounded-xl text-caption text-on-surface-variant">
            <p className="font-semibold mb-1">Password requirements:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>At least 8 characters</li>
              <li>Must not be the default password</li>
              <li>Use a mix of letters, numbers, and symbols</li>
            </ul>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-4 disabled:opacity-60">
            {loading ? "Updating..." : "Set Password & Enter Admin"}
          </button>
        </form>
      </div>
    </div>
  );
}
