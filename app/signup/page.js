"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Eye, EyeOff, CheckCircle } from "lucide-react";
import { getPhoto } from "@/lib/images/drivePhotos";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function SignupPage() {
  const [form, setForm]       = useState({ full_name: "", email: "", password: "", confirm: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);
  const router = useRouter();

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const validate = () => {
    if (!form.full_name.trim()) return "Please enter your full name.";
    if (!form.email.includes("@")) return "Please enter a valid email.";
    if (form.password.length < 8) return "Password must be at least 8 characters.";
    if (form.password !== form.confirm) return "Passwords do not match.";
    return null;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { toast.error(err); return; }
    setLoading(true);
    const supabase = createClient();

    // Use NEXT_PUBLIC_SITE_URL so the confirmation email links to production,
    // not localhost:3000. This fixes the "site can't be reached" error.
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (typeof window !== "undefined" ? window.location.origin : "");

    const { error } = await supabase.auth.signUp({
      email:    form.email,
      password: form.password,
      options:  {
        data:            { full_name: form.full_name, role: "donor" },
        emailRedirectTo: `${siteUrl}/login`,
      },
    });
    if (error) {
      toast.error(error.message);
    } else {
      setDone(true);
    }
    setLoading(false);
  };

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="max-w-md w-full text-center card p-10">
          <div className="w-16 h-16 bg-primary-fixed rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-secondary" />
          </div>
          <h1 className="font-headline text-headline-md text-primary mb-3">Check Your Inbox</h1>
          <p className="text-body-md text-on-surface-variant mb-6">
            We've sent a confirmation link to <strong>{form.email}</strong>.
            Click it to activate your account and start donating.
          </p>
          <p className="text-caption text-on-surface-variant mb-6">
            If you don't see it within a few minutes, check your spam folder.
          </p>
          <Link href="/login" className="btn-primary inline-flex">Go to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-5/12 bg-primary p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-10"
          style={{ backgroundImage: `url('${getPhoto("orphanage-care")}')` }} />
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2">
            <span className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center">
              <Heart className="w-4 h-4 text-on-secondary fill-current" />
            </span>
            <span className="font-headline font-bold text-headline-md text-on-primary">
              Helping<br /><span className="text-secondary-container">Mechons</span>
            </span>
          </Link>
        </div>
        <div className="relative z-10 space-y-4">
          <h2 className="font-headline text-headline-lg text-on-primary">
            Join 1,200+ people already making a difference.
          </h2>
          <p className="text-body-md text-on-primary-container">
            Create your account to track donations, receive receipts, and stay connected to our mission.
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <Link href="/" className="flex items-center gap-2">
              <span className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center">
                <Heart className="w-4 h-4 text-on-secondary fill-current" />
              </span>
              <span className="font-headline font-bold text-headline-md text-primary">Helping Mechons</span>
            </Link>
          </div>

          <h1 className="font-headline text-headline-lg text-primary mb-2">Create your account</h1>
          <p className="text-body-md text-on-surface-variant mb-8">Join the Helping Mechons community</p>

          <form onSubmit={handleSignup} className="space-y-5">
            <div>
              <label className="form-label">Full Name</label>
              <input name="full_name" required value={form.full_name} onChange={handleChange}
                className="form-input" placeholder="Rahul Sharma" />
            </div>
            <div>
              <label className="form-label">Email Address</label>
              <input name="email" type="email" required value={form.email} onChange={handleChange}
                className="form-input" placeholder="rahul@example.com" />
            </div>
            <div>
              <label className="form-label">Password</label>
              <div className="relative">
                <input name="password" type={showPwd ? "text" : "password"} required
                  value={form.password} onChange={handleChange}
                  className="form-input pr-12" placeholder="Min. 8 characters" />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors">
                  {showPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div>
              <label className="form-label">Confirm Password</label>
              <input name="confirm" type="password" required
                value={form.confirm} onChange={handleChange}
                className="form-input" placeholder="Repeat password" />
            </div>
            <button type="submit" disabled={loading}
              className="btn-primary w-full justify-center py-4 text-base disabled:opacity-60">
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="text-body-md text-on-surface-variant text-center mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-secondary font-semibold hover:opacity-80">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
