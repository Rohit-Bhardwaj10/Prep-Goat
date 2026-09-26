"use client";

import { authClient } from "@/lib/auth-client";
import { useState, useEffect } from "react";
import { Loader2, MailCheck } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function VerifyEmailContent() {
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [emailInput, setEmailInput] = useState(searchParams.get("email") || "");

  useEffect(() => {
    // Check if they are already verified
    authClient.getSession().then(({ data }) => {
      if (data?.user?.emailVerified) {
        router.push("/problems");
      }
    });
  }, [router]);

  const handleResend = async () => {
    setIsSending(true);
    setMessage("");
    setError("");
    
    if (!emailInput) {
      setError("Please enter your email address.");
      setIsSending(false);
      return;
    }

    const { error } = await authClient.sendVerificationEmail({
      email: emailInput,
      callbackURL: `${window.location.origin}/problems`,
    });

    if (error) {
      setError(error.message || "Failed to send verification email");
    } else {
      setMessage("Verification email sent! Please check your inbox.");
    }
    setIsSending(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1a1a1a] font-sans text-white p-4">
      <div className="max-w-md w-full bg-[#1a1a1a] border border-white/10 p-8 text-center space-y-6">
        <div className="w-16 h-16 bg-[#ff6b35]/20 text-[#ff6b35] flex items-center justify-center mx-auto mb-4">
          <MailCheck className="w-8 h-8" />
        </div>
        
        <h1 className="text-2xl font-bold font-mono uppercase tracking-tight">Verify Your Email</h1>
        
        <p className="text-white/60 leading-relaxed text-sm">
          We've sent a verification link to your email address. Please click the link to verify your account and gain access to the platform.
        </p>

        {message && (
          <div className="p-3 text-sm text-emerald-400 bg-emerald-950/50 border border-emerald-900/50">
            {message}
          </div>
        )}

        {error && (
          <div className="p-3 text-sm text-red-400 bg-red-950/50 border border-red-900/50">
            {error}
          </div>
        )}
        
        <div className="space-y-3">
          <input
            type="email"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            placeholder="Confirm your email"
            className="w-full px-4 py-2.5 bg-[#1a1a1a] border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent transition-all shadow-sm placeholder:text-white/30 text-white text-sm"
          />
          <button
            onClick={handleResend}
            disabled={isSending || !emailInput}
            className="w-full py-2.5 bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Resend Verification Email
          </button>
        </div>

        <div className="pt-6 border-t border-white/10">
          <button 
            onClick={async () => {
              await authClient.signOut();
              window.location.href = "/login";
            }}
            className="text-sm text-white/50 hover:text-white transition-colors"
          >
            Sign out and use a different account
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#1a1a1a]">
        <Loader2 className="w-8 h-8 text-[#ff6b35] animate-spin" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
