"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Code2, ArrowRight, Loader2 } from "lucide-react";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    const { data, error } = await authClient.signUp.email({
      email,
      password,
      name,
    });
    if (error) {
      setError(error.message || "Failed to sign up");
      setIsLoading(false);
    } else {
      window.location.href = `/verify-email?email=${encodeURIComponent(email)}`;
    }
  };

  const handleGoogleSignup = async () => {
    setIsGoogleLoading(true);
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/problems"
    });
  };

  return (
    <div className="min-h-screen flex bg-[#0a0a0a] font-sans text-white selection:bg-white/20">
      {/* Left side - Visual/Brand */}
      <div className="hidden lg:flex w-1/2 bg-[#0a0a0a] p-12 flex-col relative overflow-hidden border-r border-white/10">
        <div className="absolute inset-0 opacity-10" 
             style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        
        {/* Subtle glow */}
        <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-[#ff6b35]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex-none">
          <Link href="/" className="flex items-center gap-2 text-white hover:opacity-80 transition-opacity w-fit">
            <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center border border-white/10">
              <Code2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold tracking-tight text-lg">PREP-G</span>
          </Link>
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-center">
          <div className="max-w-md">
            <h2 className="text-4xl font-bold font-mono uppercase tracking-tight mb-6 leading-[1.1] text-white">
              Start your journey.
            </h2>
            <p className="text-white/50 text-lg leading-relaxed mb-8">
              Create an account to track your progress, save your design attempts, and receive personalized AI evaluations.
            </p>
            
            <div className="flex flex-col gap-4 border-t border-white/10 pt-8 mt-8">
              <div className="flex items-center gap-3 text-white/70">
                <div className="w-1.5 h-1.5 rounded-full bg-[#ff6b35]" />
                <span className="text-sm">Canonical system design problems</span>
              </div>
              <div className="flex items-center gap-3 text-white/70">
                <div className="w-1.5 h-1.5 rounded-full bg-[#ff6b35]" />
                <span className="text-sm">Distraction-free markdown editor</span>
              </div>
              <div className="flex items-center gap-3 text-white/70">
                <div className="w-1.5 h-1.5 rounded-full bg-[#ff6b35]" />
                <span className="text-sm">Instant, criterion-based AI feedback</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 relative z-10 bg-[#0a0a0a]">
        <div className="w-full max-w-sm space-y-8">
          
          {/* Mobile Header */}
          <div className="lg:hidden flex justify-center mb-12">
            <Link href="/" className="flex items-center gap-2 text-white hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center border border-white/10">
                <Code2 className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold tracking-tight text-lg">PREP-G</span>
            </Link>
          </div>

          <div className="text-center lg:text-left">
            <h1 className="text-3xl font-bold tracking-tight mb-2 font-mono uppercase text-white">Create an account</h1>
            <p className="text-white/50 text-sm">Enter your details to get started.</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-5">
            {error && (
              <div className="p-3 text-sm text-red-400 bg-red-950/50 border border-red-900/50 rounded-lg">
                {error}
              </div>
            )}
            
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-white/70">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#1a1a1a] rounded-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent transition-all shadow-sm placeholder:text-white/30 text-white"
                placeholder="Jane Doe"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-white/70">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#1a1a1a] rounded-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent transition-all shadow-sm placeholder:text-white/30 text-white"
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-white/70">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#1a1a1a] rounded-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent transition-all shadow-sm text-white placeholder:text-white/30"
                placeholder="••••••••"
                required
                minLength={8}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || isGoogleLoading}
              className="w-full py-2.5 bg-[#ff6b35] text-white font-medium rounded-lg hover:bg-[#e05a2a] transition-all shadow-sm flex items-center justify-center gap-2 group disabled:opacity-70 mt-4"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Create Account
              {!isLoading && <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />}
            </button>
          </form>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="flex-shrink-0 mx-4 text-white/30 text-sm">or</span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>

          <button
            onClick={handleGoogleSignup}
            disabled={isLoading || isGoogleLoading}
            className="w-full py-2.5 bg-white text-black font-medium rounded-lg hover:bg-white/90 transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isGoogleLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            )}
            Sign up with Google
          </button>

          <p className="text-center text-sm text-white/50">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-white hover:text-[#ff6b35] transition-colors">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
