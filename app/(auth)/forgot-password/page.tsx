"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { forgotPassword, getAuthErrorMessage } from "@/lib/auth";
import { useGoogleAuth } from "@/lib/use-google";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { startGoogleAuth, loading: googleLoading } = useGoogleAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const response = await forgotPassword(email);
      toast.success(response.message ?? "Check your email", {
        description: "We've sent a reset link to your inbox.",
        duration: 5000,
      });
      router.push("/login");
    } catch (err: unknown) {
      setError(
        getAuthErrorMessage(
          err,
          "We couldn't send a reset link right now. Please try again later.",
        ),
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-linear-to-br from-white via-white to-amber-50">
      {/* Top bar */}
      <div className="flex items-center justify-between px-10 py-8">
        <div className="flex items-center gap-2.5">
          <img
            src="/logo2.png"
            alt="Growdex"
            className="w-8 h-8 object-contain"
          />
          <span className="text-gray-900 font-gilroy-bold text-xl tracking-tight">
            Growdex
          </span>
        </div>
        <button className="flex items-center gap-2 bg-[#1c1c1c] border border-white/10 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-black/80 transition-colors">
          Menu
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M2 4h12M2 8h12M2 12h12"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-between gap-12 px-10 lg:px-20 py-10">
        {/* ── Left: form ── */}
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h1 className="text-5xl font-gilroy-bold text-gray-900 leading-tight">
              Forgot your password?
            </h1>
            <p className="mt-3 text-gray-500">
              We&apos;ll send you a link to reset your password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="email"
                placeholder="Email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-4 py-3.5 bg-white border rounded-xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 transition-shadow ${
                  error
                    ? "border-red-300 focus:ring-red-200/60 focus:border-red-400"
                    : "border-gray-200 focus:ring-khaki-200/60 focus:border-khaki-200"
                }`}
              />
              {error && (
                <p className="mt-1.5 text-sm text-red-600">{error}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-khaki-200 hover:bg-khaki-300 active:bg-peru-200 text-gray-900 font-semibold text-sm rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Sending..." : "Send code"}
            </button>
          </form>

          <div className="flex items-center gap-3">
            <hr className="flex-1 border-gray-200" />
            <span className="text-sm text-gray-400">Or</span>
            <hr className="flex-1 border-gray-200" />
          </div>

          <button
            type="button"
            onClick={startGoogleAuth}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-900 font-medium text-sm hover:bg-gray-50 active:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <img
              src="/devicon_google.png"
              alt="Google"
              className="w-5 h-5 object-contain"
            />
            {googleLoading ? "Redirecting..." : "Sign in with Google"}
          </button>
        </div>

        {/* ── Right: illustration ── */}
        <div className="hidden lg:flex flex-1 items-center justify-center">
          <img
            src="/forgot-password.png"
            alt=""
            className="w-full max-w-xl object-contain"
          />
        </div>
      </div>
    </div>
  );
}
