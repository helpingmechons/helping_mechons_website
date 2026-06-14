"use client";
import { useState } from "react";
import Link from "next/link";
import { Heart, CheckCircle, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.includes("@")) { toast.error("Please enter a valid email."); return; }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}/reset-password`,
    });
    if (error) { toast.error(error.message); }
    else       { setSent(true); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-md">
        <Link href="/login" className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Login
        </Link>

        <div className="flex items-center gap-2 mb-8">
          <span className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center">
            <Heart className="w-4 h-4 text-on-secondary fill-current" />
          </span>
          <span className="font-headline font-bold text-headline-md text-primary">Helping Mechons</span>
        </div>

        {!sent ? (
          <>
            <h1 className="font-headline text-headline-lg text-primary mb-2">Reset Password</h1>
            <p className="text-body-md text-on-surface-variant mb-8">
              Enter your email address and we'll send you a link to reset your password.
            </p>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="form-label">Email Address</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  className="form-input" placeholder="you@example.com" />
              </div>
              <button type="submit" disabled={loading}
                className="btn-primary w-full justify-center py-4 disabled:opacity-60">
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          </>
        ) : (
          <div className="card p-10 text-center">
            <div className="w-16 h-16 bg-primary-fixed rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-secondary" />
            </div>
            <h1 className="font-headline text-headline-md text-primary mb-3">Check Your Email</h1>
            <p className="text-body-md text-on-surface-variant mb-6">
              We've sent a password reset link to <strong>{email}</strong>.
              Click the link to set a new password.
            </p>
            <Link href="/login" className="btn-primary inline-flex">Back to Login</Link>
          </div>
        )}
      </div>
    </div>
  );
}
