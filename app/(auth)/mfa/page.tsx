"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import { verifyMFA } from "@/lib/auth";
import { toast } from "sonner";

function MfaPageContent() {
  const router = useRouter();

  const [status, setStatus] = useState<string | null>(null);
  const [uri, setUri] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);

  const [qrDataUrl, setQrDataUrl] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const s = sessionStorage.getItem("mfa_status");
    const u = sessionStorage.getItem("mfa_uri");
    const sec = sessionStorage.getItem("mfa_secret");

    if (!s) {
      router.push("/login");
      return;
    }

    setStatus(s);
    if (u) setUri(u);
    if (sec) setSecret(sec);

    if (u) {
      QRCode.toDataURL(u)
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error("QR Code Generation Error:", err));
    }
  }, [router]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.match(/^[0-9]?$/)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async () => {
    const token = otp.join("");
    if (token.length < 6) {
      setError("Please enter a 6-digit code");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await verifyMFA(token);
      toast.success("Authentication successful");

      // Clear sensitive info
      sessionStorage.removeItem("mfa_status");
      sessionStorage.removeItem("mfa_uri");
      sessionStorage.removeItem("mfa_secret");

      if (res.onboardingCompleted) {
        router.push("/panel");
      } else {
        router.push("/onboarding");
      }
    } catch (err: any) {
      setError(err.message || "Invalid authentication code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!status) return null;

  const isSetup = status === "MFA_SETUP_REQUIRED";

  return (
    <div className="flex-1 p-4 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-end mb-6">
          <button className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors">
            Menu ☰
          </button>
        </div>

        <div className="mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Secure your Growdex account
          </h1>
          <p className="text-gray-600">
            {isSetup
              ? "You can secure your account by following the processes"
              : "Enter your authentication code."}
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="space-y-12">
          {/* Step 1 - Only show during Setup */}
          {isSetup ? (
            <>
              <div className="relative">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold shrink-0">
                    1
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1 border-b  inline-block border-blue-500 text-slate-600">
                      Install a compatible application
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Choose from one of our many supported apps for your
                      mobile.
                    </p>
                    <div className="flex gap-4">
                      <div className="w-24 h-20 border border-gray-200 flex items-center justify-center bg-white shadow-sm">
                        <svg viewBox="0 0 48 48" className="w-10 h-10">
                          <path
                            fill="#FFC107"
                            d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                          />
                          <path
                            fill="#FF3D00"
                            d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                          />
                          <path
                            fill="#4CAF50"
                            d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                          />
                          <path
                            fill="#1976D2"
                            d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                          />
                        </svg>
                      </div>
                      <div className="w-24 h-20 border border-gray-200 flex items-center justify-center bg-white shadow-sm p-4">
                        <svg viewBox="0 0 23 23" className="w-8 h-8">
                          <path fill="#f35325" d="M0 0h11v11H0z" />
                          <path fill="#81bc06" d="M12 0h11v11H12z" />
                          <path fill="#05a6f0" d="M0 12h11v11H0z" />
                          <path fill="#ffba08" d="M12 12h11v11H12z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute left-4 top-10 bottom-[-48px] w-px bg-gray-200"></div>
              </div>

              {/* Step 2 - Only show during Setup */}
              <div className="relative">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold shrink-0">
                    2
                  </div>
                  <div className="flex flex-col md:flex-row md:items-start justify-between w-full border-b border-gray-200 pb-8">
                    <div className="max-w-md">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1 border-b pb-1 inline-block border-transparent">
                        Open your authenticator app
                      </h3>
                      <p className="text-sm text-gray-600 mt-2">
                        Scan the given QR Code, with your authenticator app.
                        Alternatively, you can manually enter your secret key by
                        clicking:
                      </p>
                      <div className="mt-4 break-all bg-gray-50 p-2 rounded text-sm text-gray-700 font-mono">
                        {secret || "Loading secret key..."}
                      </div>
                    </div>
                    <div className="mt-6 md:mt-0 shrink-0">
                      {qrDataUrl ? (
                        <img
                          src={qrDataUrl}
                          alt="QR Code"
                          className="w-32 h-32 border border-gray-200 rounded-lg"
                        />
                      ) : (
                        <div className="w-32 h-32 border border-gray-200 bg-gray-100 rounded-lg flex items-center justify-center text-sm text-gray-400">
                          Loading QR...
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="absolute left-4 top-10 bottom-[-48px] w-px bg-gray-200"></div>
              </div>

              {/* Step 3 */}
              <div className="relative">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold shrink-0">
                    3
                  </div>
                  <div className="w-full">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 border-b pb-1 inline-block border-transparent">
                      Enter a MFA code from your app
                    </h3>
                    <p className="text-sm text-gray-600 mt-2 mb-6">
                      Enter a code from your authenticator app to confirm setup
                    </p>

                    <div className="flex gap-3 mb-8">
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          ref={(el) => {
                            inputRefs.current[index] = el;
                          }}
                          type="text"
                          maxLength={1}
                          value={digit}
                          onChange={(e) =>
                            handleOtpChange(index, e.target.value)
                          }
                          onKeyDown={(e) => handleKeyDown(index, e)}
                          className="w-12 h-14 md:w-14 md:h-16 border border-gray-200 rounded-lg text-center text-xl font-semibold bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:bg-white transition-colors"
                        />
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <button
                        onClick={handleSubmit}
                        disabled={loading || otp.join("").length < 6}
                        className="px-6 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? "Submitting..." : "Submit code"}
                      </button>

                      {status !== "MFA_SETUP_REQUIRED" && (
                        <button
                          onClick={() => router.push("/panel")}
                          className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                        >
                          » Skip authentication
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            // MFA Challenge View
            <div className="max-w-md">
              <div className="flex items-center gap-2 mb-6 text-sm font-semibold text-gray-800">
                You can setup your authentication with{" "}
                <span className="font-bold text-base text-gray-900">
                  <svg viewBox="0 0 48 48" className="w-4 h-4">
                    <path
                      fill="#FFC107"
                      d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                    />
                    <path
                      fill="#FF3D00"
                      d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                    />
                    <path
                      fill="#4CAF50"
                      d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                    />
                    <path
                      fill="#1976D2"
                      d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                    />
                  </svg>
                </span>{" "}
                or
                <svg viewBox="0 0 23 23" className="w-4 h-4 ml-1">
                  <path fill="#f35325" d="M0 0h11v11H0z" />
                  <path fill="#81bc06" d="M12 0h11v11H12z" />
                  <path fill="#05a6f0" d="M0 12h11v11H0z" />
                  <path fill="#ffba08" d="M12 12h11v11H12z" />
                </svg>
              </div>

              <div className="flex gap-3 mb-8">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-14 md:w-14 md:h-16 border border-gray-200 rounded-lg text-center text-xl font-semibold bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:bg-white transition-colors"
                  />
                ))}
              </div>

              <div className="flex items-center">
                <button
                  onClick={handleSubmit}
                  disabled={loading || otp.join("").length < 6}
                  className="px-6 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-gray-900 text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Confirming..." : "Confirm 2FA"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MfaPage() {
  return (
    <div className="h-screen flex bg-white overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden md:block w-64 bg-[#2a2a2a] text-white p-8 shrink-0 h-full">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8">
            <img src="/logo.png" alt="Growdex logo" />
          </div>
          <span className="font-semibold text-lg">Growdex</span>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 h-full overflow-y-auto pb-20 relative">
        <Suspense
          fallback={
            <div className="flex h-full flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          }
        >
          <MfaPageContent />
        </Suspense>
      </div>
    </div>
  );
}