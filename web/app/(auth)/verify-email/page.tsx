"use client";

import { authClient } from "@/lib/auth-client";
import { useState, useEffect } from "react";
import { Loader2, MailCheck, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function VerifyEmailPage() {
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

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
    
    const { data: session } = await authClient.getSession();
    if (!session?.user?.email) {
      setError("No user session found. Please log in again.");
      setIsSending(false);
      return;
    }

    const { error } = await authClient.sendVerificationEmail({
      email: session.user.email,
      callbackURL: "/problems", // Where they should go after verifying
    });

    if (error) {
      setError(error.message || "Failed to send verification email");
    } else {
      setMessage("Verification email sent! Please check your inbox.");
    }
    setIsSending(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] font-sans text-white p-4">
      <div className="max-w-md w-full bg-[#1a1a1a] border border-white/10 rounded-2xl p-8 text-center space-y-6">
        <div className="w-16 h-16 bg-[#ff6b35]/20 text-[#ff6b35] rounded-full flex items-center justify-center mx-auto mb-4">
          <MailCheck className="w-8 h-8" />
        </div>
        
        <h1 className="text-2xl font-bold font-mono uppercase tracking-tight">Verify Your Email</h1>
        
        <p className="text-white/60 leading-relaxed text-sm">
          We've sent a verification link to your email address. Please click the link to verify your account and gain access to the platform.
        </p>

        {message && (
          <div className="p-3 text-sm text-emerald-400 bg-emerald-950/50 border border-emerald-900/50 rounded-lg">
            {message}
          </div>
        )}

        {error && (
          <div className="p-3 text-sm text-red-400 bg-red-950/50 border border-red-900/50 rounded-lg">
            {error}
          </div>
        )}

        <button
          onClick={handleResend}
          disabled={isSending}
          className="w-full py-2.5 bg-white/5 border border-white/10 text-white font-medium rounded-lg hover:bg-white/10 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Resend Verification Email
        </button>

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
