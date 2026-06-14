"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Heart, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const [password,  setPassword]  = useState("");
  const [confirm,   setConfirm]   = useState("");
  const [showPass,  setShowPass]  = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [done,      setDone]      = useState(false);
  const [error,     setError]     = useState(null);
  const [ready,     setReady]     = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // Supabase sends the user here with a hash fragment containing the session tokens.
  // onAuthStateChange fires with event PASSWORD_RECOVERY once the fragment is parsed.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
      toast.error(error.message);
    } else {
      setDone(true);
      setTimeout(() => router.push("/login"), 3000);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <span className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center">
            <Heart className="w-4 h-4 text-on-secondary fill-current" />
          </span>
          <span className="font-headline font-bold text-headline-md text-primary leading-none">
            Helping<br />
            <span className="text-secondary">Mechons</span>
          </span>
        </div>

        {done ? (
          <div className="card p-10 text-center">
            <div className="w-16 h-16 bg-primary-fixed rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-secondary" />
            </div>
            <h1 className="font-headline text-headline-md text-primary mb-3">Password Updated!</h1>
            <p className="text-body-md text-on-surface-variant mb-6">
              Your password has been reset successfully. Redirecting you to login…
            </p>
            <Link href="/login" className="btn-primary inline-flex">Go to Login</Link>
          </div>
        ) : !ready ? (
          <div className="card p-10 text-center">
            <div className="w-16 h-16 bg-surface-container-high rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-on-surface-variant" />
            </div>
            <h1 className="font-headline text-headline-md text-primary mb-3">Waiting for Link…</h1>
            <p className="text-body-md text-on-surface-variant mb-6">
              Open the reset link from your email. If you arrived here directly, please request a new link.
            </p>
            <Link href="/forgot-password" className="btn-primary inline-flex">Request New Link</Link>
          </div>
        ) : (
          <>
            <h1 className="font-headline text-headline-lg text-primary mb-2">Set New Password</h1>
            <p className="text-body-md text-on-surface-variant mb-8">
              Choose a strong password for your Helping Mechons account.
            </p>

            {error && (
              <div className="mb-6 p-4 bg-error-container rounded-xl text-on-error-container text-body-md flex items-center gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="form-label">New Password</label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    required
                    minLength={8}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="form-input pr-10"
                    placeholder="Minimum 8 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="form-label">Confirm Password</label>
                <input
                  type={showPass ? "text" : "password"}
                  required
                  minLength={8}
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  className="form-input"
                  placeholder="Re-enter your new password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center py-4 disabled:opacity-60"
              >
                {loading ? "Updating…" : "Update Password"}
              </button>
            </form>

            <p className="mt-6 text-center text-body-md text-on-surface-variant">
              Remembered it?{" "}
              <Link href="/login" className="text-secondary font-semibold hover:underline">
                Back to Login
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
