"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Heart, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getPhoto } from "@/lib/images/drivePhotos";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const router       = useRouter();
  const searchParams = useSearchParams();
  const next         = searchParams.get("next") || "/profile";

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Welcome back!");
      router.push(next);
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-5/12 bg-primary p-12 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-10"
          style={{ backgroundImage: `url('${getPhoto("education-support")}')` }}
        />
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
          <h2 className="font-headline text-headline-lg text-on-primary leading-tight">
            Every rupee you give changes a life.
          </h2>
          <p className="text-body-md text-on-primary-container">
            Login to track your donation history, view impact reports, and stay connected with our mission.
          </p>
          <div className="flex gap-6 mt-8">
            {[{ stat: "1,200+", label: "Lives" }, { stat: "₹25L+", label: "Raised" }, { stat: "85K", label: "Students" }].map(({ stat, label }) => (
              <div key={label}>
                <p className="font-headline font-bold text-headline-md text-secondary-container">{stat}</p>
                <p className="text-caption text-on-primary-container uppercase tracking-wider">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <Link href="/" className="flex items-center gap-2">
              <span className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center">
                <Heart className="w-4 h-4 text-on-secondary fill-current" />
              </span>
              <span className="font-headline font-bold text-headline-md text-primary">Helping Mechons</span>
            </Link>
          </div>

          <h1 className="font-headline text-headline-lg text-primary mb-2">Welcome back</h1>
          <p className="text-body-md text-on-surface-variant mb-8">
            Login to your Helping Mechons account
          </p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="form-label">Email Address</label>
              <input
                type="email" required autoComplete="email"
                value={email} onChange={e => setEmail(e.target.value)}
                className="form-input" placeholder="you@example.com"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="form-label mb-0">Password</label>
                <Link href="/forgot-password" className="text-caption text-secondary hover:opacity-80">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"} required autoComplete="current-password"
                  value={password} onChange={e => setPassword(e.target.value)}
                  className="form-input pr-12" placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors">
                  {showPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="btn-primary w-full justify-center py-4 text-base disabled:opacity-60">
              {loading ? "Logging in..." : "Login to My Account"}
            </button>
          </form>

          <p className="text-body-md text-on-surface-variant text-center mt-6">
            Don't have an account?{" "}
            <Link href="/signup" className="text-secondary font-semibold hover:opacity-80">
              Create Account
            </Link>
          </p>

          <p className="text-caption text-on-surface-variant text-center mt-8">
            By logging in you agree to our{" "}
            <Link href="/terms" className="underline">Terms</Link>
            {" & "}
            <Link href="/privacy" className="underline">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
