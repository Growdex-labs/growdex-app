"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock } from "lucide-react";
import { resetPassword } from "@/lib/auth";
import { toast } from "sonner";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");

  useEffect(() => {
    if (!token) {
      toast.error("Invalid link");
      router.push("/login");
    }
  }, [token, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setConfirmError("");

    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters long");
      return;
    }
    if (!password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/)) {
      setPasswordError(
        "Password must contain an uppercase letter, lowercase letter, number and special character",
      );
      return;
    }
    if (password !== confirmPassword) {
      setConfirmError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      const response = await resetPassword(token!, password, confirmPassword);
      toast.success(response.message ?? "Password reset successful", {
        description: "Use your new password to sign in.",
        duration: 5000,
      });
      router.push("/login");
    } catch (err: any) {
      setConfirmError(err.message || "Something went wrong. Please try again.");
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
              Reset your password?
            </h1>
            <p className="mt-3 text-gray-500">
              Enter a new password for your account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="password"
                  placeholder="New password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-11 pr-4 py-3.5 bg-white border rounded-xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 transition-shadow ${
                    passwordError
                      ? "border-red-300 focus:ring-red-200/60 focus:border-red-400"
                      : "border-gray-200 focus:ring-khaki-200/60 focus:border-khaki-200"
                  }`}
                />
              </div>
              {passwordError && (
                <p className="mt-1.5 text-sm text-red-600">{passwordError}</p>
              )}
            </div>

            <div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="password"
                  placeholder="Confirm password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full pl-11 pr-4 py-3.5 bg-white border rounded-xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 transition-shadow ${
                    confirmError
                      ? "border-red-300 focus:ring-red-200/60 focus:border-red-400"
                      : "border-gray-200 focus:ring-khaki-200/60 focus:border-khaki-200"
                  }`}
                />
              </div>
              {confirmError && (
                <p className="mt-1.5 text-sm text-red-600">{confirmError}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-khaki-200 hover:bg-khaki-300 active:bg-peru-200 text-gray-900 font-semibold text-sm rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Resetting..." : "Reset password"}
            </button>
          </form>
        </div>

        {/* ── Right: illustration ── */}
        <div className="hidden lg:flex flex-1 items-center justify-center">
          <img
            src="/reset%20password.png"
            alt=""
            className="w-full max-w-xl object-contain"
          />
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-white via-white to-amber-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
