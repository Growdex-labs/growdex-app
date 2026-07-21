"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, Lock, Sparkles } from "lucide-react";
import { getAuthErrorMessage, register } from "@/lib/auth";
import { useGoogleAuth } from "@/lib/use-google";
import { toast } from "sonner";

const OrbitRing = ({
  size,
  opacity,
  fade,
}: {
  size: number;
  opacity: number;
  fade?: boolean;
}) => {
  const fadeMask = fade
    ? "linear-gradient(to bottom, transparent 0%, black 22%, black 60%, transparent 100%)"
    : undefined;

  return (
    <svg
      className="absolute pointer-events-none"
      style={{
        width: size,
        height: size,
        opacity,
        maskImage: fadeMask,
        WebkitMaskImage: fadeMask,
      }}
      viewBox={`0 0 ${size} ${size}`}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={size / 2 - 1}
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeDasharray="6 16"
      />
    </svg>
  );
};

const FeatureCard = ({
  children,
  className,
  glow,
}: {
  children: React.ReactNode;
  className?: string;
  glow: string;
}) => (
  <div
    className={`absolute isolate flex items-start gap-3 bg-white/5 border border-white/10 rounded-xl p-4 shadow-lg w-34 h-34 overflow-hidden ${className}`}
  >
    <div
      className="absolute -z-10 -bottom-1 -right-1 w-20 h-20 rounded-full blur-xl pointer-events-none"
      style={{ background: glow }}
    />
    {children}
  </div>
);

const Dot = ({ className }: { className: string }) => (
  <div className={`absolute rounded-full pointer-events-none ${className}`} />
);

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { startGoogleAuth, loading: googleLoading } = useGoogleAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const response = await register(email, password);

      if (
        response.status === "MFA_SETUP_REQUIRED" ||
        response.status === "MFA_CHALLENGE"
      ) {
        sessionStorage.removeItem("mfa_status");
        sessionStorage.removeItem("mfa_uri");
        sessionStorage.removeItem("mfa_secret");
        sessionStorage.setItem("mfa_status", response.status);
        if (response.uri) sessionStorage.setItem("mfa_uri", response.uri);
        if (response.secret)
          sessionStorage.setItem("mfa_secret", response.secret);
        router.push("/mfa");
        return;
      }

      toast.success("Registration successful", {
        description: "Check your email for verification",
        duration: 3000,
      });
      setTimeout(
        () =>
          router.push(response.onboardingCompleted ? "/panel" : "/onboarding"),
        1500,
      );
    } catch (err: unknown) {
      setError(
        getAuthErrorMessage(
          err,
          "We couldn't create your account right now. Please try again later.",
        ),
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Cream background fills the whole page — dark panel sits inside it as a card
    <div className="relative min-h-screen flex flex-col bg-linear-to-br from-white via-white to-amber-50">
      {/* Top bar — floats above both the dark panel and the cream background */}
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-10 py-8">
        <div className="flex items-center gap-2.5">
          <img
            src="/logo.png"
            alt="Growdex"
            className="w-8 h-8 object-contain"
          />
          <span className="text-gray-200 font-gilroy-bold text-xl tracking-tight">
            Growdex
          </span>
        </div>
        <button className="flex items-center gap-2 bg-[#1c1c1c] border border-white/10 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-white/10 transition-colors">
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

      {/* Content row */}
      <div className="flex flex-1">
        {/* ── Left: dark panel as inset rounded card ── */}
        <div className="hidden lg:flex w-[48%] shrink-0 p-5">
          <div className="flex-1 bg-[#333333] rounded-3xl overflow-hidden flex flex-col relative">
            {/* Orbital rings + center logo */}
            <div className="absolute inset-0 flex items-center justify-center">
              <OrbitRing size={530} opacity={0.08} fade />
              <OrbitRing size={430} opacity={0.12} />
              <OrbitRing size={330} opacity={0.18} />
              <OrbitRing size={230} opacity={0.25} />

              {/* Ambient glow */}
              <div className="absolute w-56 h-56 rounded-full bg-[#ffe95c]/10 blur-[60px]" />
              <div className="absolute w-36 h-36 rounded-full bg-khaki-200/15 blur-[30px]" />

              {/* Center logo — glow baked into the image */}
              <div className="relative z-10 w-44 h-44 flex items-center justify-center">
                <img
                  src="/logo-glow.png"
                  alt="Growdex"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* Floating feature cards */}
            <FeatureCard
              className="left-12 top-[24%] flex-col items-start"
              glow="radial-gradient(50% 50% at 50% 50%, rgba(0, 129, 251, 0.8) 0%, rgba(0, 129, 251, 0) 100%)"
            >
              <img
                src="/logos_meta-icon.png"
                alt="Meta"
                className="size-12 object-contain"
              />
              <div className="mt-auto">
                <p className="text-white text-sm font-semibold leading-tight">
                  Meta Ads
                </p>
                <div className="flex items-center gap-1">
                  <p className="text-gray-400 text-xs">Connected</p>
                  <div className="flex items-center p-0.5 justify-center rounded-full bg-green-400">
                    <Check className="size-2" strokeWidth={6} />
                  </div>
                </div>
              </div>
            </FeatureCard>

            <FeatureCard
              className="right-[12%] top-[22%] flex-col items-start"
              glow="radial-gradient(50% 50% at 50% 50%, rgba(0, 242, 234, 0.8) 0%, rgba(0, 242, 234, 0) 100%)"
            >
              <img
                src="/logos_tiktok-icon.png"
                alt="TikTok"
                className="size-12 object-contain"
              />
              <div className="mt-auto">
                <p className="text-white text-sm font-semibold leading-tight">
                  TikTok Ads
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <p className="text-gray-400 text-xs">Connected</p>
                  <div className="flex items-center p-0.5 justify-center rounded-full bg-green-400">
                    <Check className="size-2" strokeWidth={6} />
                  </div>
                </div>
              </div>
            </FeatureCard>

            <FeatureCard
              className="right-10 top-[56%] flex-col items-start"
              glow="radial-gradient(50% 50% at 50% 50%, rgba(203, 48, 224, 0.8) 0%, rgba(203, 48, 224, 0) 100%)"
            >
              <div className="size-12 flex i8ms-center justify-center text-purple-300 text-4xl leading-none">
                <img
                  src="/sparkles.png"
                  alt="Wallet"
                  className="size-8 object-contain"
                />
              </div>
              <div>
                <p className="text-white text-sm font-semibold leading-tight">
                  AI Optimization
                </p>
                <p className="text-gray-400 text-xs mt-0.5">ROAS Increase</p>
                <p className="text-green-400 text-xs font-bold">+24%</p>
              </div>
            </FeatureCard>

            <FeatureCard
              className="left-20 bottom-[26%] flex-col items-start"
              glow="radial-gradient(50% 50% at 50% 50%, rgba(173, 157, 55, 0.8) 0%, rgba(173, 157, 55, 0) 100%)"
            >
              <img
                src="/cash.png"
                alt="Wallet"
                className="size-12 object-contain"
              />
              <div>
                <p className="text-white text-sm font-semibold leading-tight">
                  Unified Wallet
                </p>
                <p className="text-gray-400 text-xs mt-0.5">Balance</p>
                <p className="text-white text-sm font-bold">$24,680.84</p>
              </div>
            </FeatureCard>

            {/* Scatter dots */}
            <Dot className="w-2 h-2 bg-green-400 top-[20%] left-[38%] opacity-50" />
            <Dot className="w-2 h-2 bg-orange-400 top-[52%] right-[10%] opacity-80" />
            <Dot className="w-2 h-2 bg-[#ffe95c] bottom-[19%] left-[54%] opacity-70" />
            <Dot className="w-2 h-2 bg-green-300 bottom-[28%] left-12 opacity-60" />
            <Dot className="w-1.5 h-1.5 bg-purple-400 top-[42%] right-[18%] opacity-50" />

            {/* Bottom tagline */}
            <div className="absolute bottom-8 inset-x-0 z-20 text-center">
              <h2 className="text-4xl font-lexend text-white leading-snug">
                Create. Optimize. <span className="text-khaki-200">Scale.</span>
              </h2>
            </div>
          </div>
        </div>

        {/* ── Right: form on the cream background ── */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md space-y-6">
            {/* Mobile logo */}
            <div className="flex lg:hidden items-center justify-center mb-2">
              <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center">
                <img
                  src="/logo.png"
                  alt="Growdex"
                  className="w-8 h-8 object-contain"
                />
              </div>
            </div>

            <h1 className="text-3xl font-gilroy-bold text-gray-900">
              Sign up to Growdex
            </h1>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                placeholder="Your email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-khaki-200/60 focus:border-khaki-200 transition-shadow"
              />

              <div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    type="password"
                    placeholder="Password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full pl-11 pr-4 py-3.5 bg-white border rounded-xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 transition-shadow ${
                      error
                        ? "border-red-300 focus:ring-red-200/60 focus:border-red-400"
                        : "border-gray-200 focus:ring-khaki-200/60 focus:border-khaki-200"
                    }`}
                  />
                </div>
                {error && (
                  <p className="mt-1.5 text-sm text-red-600">{error}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-khaki-200 hover:bg-khaki-300 active:bg-peru-200 text-gray-900 font-semibold text-sm rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Please wait..." : "Sign up"}
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
              {googleLoading ? "Redirecting..." : "Sign up with Google"}
            </button>

            <p className="text-center text-sm text-gray-500">
              Got an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-gray-900 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
