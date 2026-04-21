"use client";

import React, { useState } from "react";
import { PanelLayout } from "../../components/panel-layout";
import { SettingsSidebar } from "../../components/settings-sidebar";
import { SettingsHeader } from "../components/settings-header";
import { useMe } from "@/context/me-context";
import { apiFetch } from "@/lib/auth";

const activeSessions = [
  {
    id: 1,
    device: "Safari on Mac Os X",
    iconType: "safari",
    location: "Lagos, NG",
    lastActive: "1hr, ago",
  },
  {
    id: 2,
    device: "Chrome on Hp Elitebook",
    iconType: "chrome",
    location: "Lagos, NG",
    lastActive: "1hr, ago",
  },
  {
    id: 3,
    device: "Ebuka's iMac",
    iconType: "apple",
    location: "Lagos, NG",
    lastActive: "1hr, ago",
  },
];

export default function SecurityControlPage() {
  const { me } = useMe();
  const [activeTab, setActiveTab] = useState("2fa");
  const [sessions, setSessions] = useState(activeSessions);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(
    null,
  );
  
  // Password Change State
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  // 2FA State
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [showDisable2FAConfirm, setShowDisable2FAConfirm] = useState(false);
  const [showDisable2FASuccess, setShowDisable2FASuccess] = useState(false);
  const [showEnablePassword, setShowEnablePassword] = useState(false);
  const [showEnableOTP, setShowEnableOTP] = useState(false);
  const [showEnableSuccess, setShowEnableSuccess] = useState(false);
  const [disablePassword, setDisablePassword] = useState("");
  const [enablePassword, setEnablePassword] = useState("");
  const [enableOTP, setEnableOTP] = useState(["", "", "", "", "", ""]);
  
  const userEmail = me?.email ?? "";

  const handleApplyPasswordChanges = async () => {
    setPasswordError("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Please fill in all fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      return;
    }

    setIsSubmittingPassword(true);

    try {
      const res = await apiFetch("/users/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      if (!res.ok) {
        let msg = "Failed to update password. Please try again.";
        try {
          const json = await res.json();
          msg = json.error || json.message || msg;
        } catch(e) {}
        setPasswordError(msg);
        return;
      }

      // Success - reset and close
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setIsChangePasswordModalOpen(false);
    } catch (err) {
      setPasswordError("An error occurred. Please try again.");
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  const handleClosePasswordModal = () => {
    setIsChangePasswordModalOpen(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError("");
  };

  const handleTerminateClick = (sessionId: number) => {
    setSelectedSessionId(sessionId);
    setIsModalOpen(true);
  };

  const handleConfirmTerminate = () => {
    if (selectedSessionId !== null) {
      setSessions(
        sessions.filter((session) => session.id !== selectedSessionId),
      );
    }
    setIsModalOpen(false);
    setSelectedSessionId(null);
  };

  const handleCancelTerminate = () => {
    setIsModalOpen(false);
    setSelectedSessionId(null);
  };

  const handleEdit2FA = () => {
    setIs2FAModalOpen(true);
    setShowEnablePassword(false);
    setShowEnableOTP(false);
    setShowEnableSuccess(false);
    setShowDisable2FAConfirm(false);
    setShowDisable2FASuccess(false);
  };

  const handleDisable2FA = () => {
    setShowDisable2FAConfirm(true);
  };

  const handleConfirmDisable2FA = () => {
    // Disable 2FA logic here
    setIs2FAEnabled(false);
    setShowDisable2FASuccess(true);
  };

  const handleDisable2FAComplete = () => {
    setShowDisable2FASuccess(false);
    setShowDisable2FAConfirm(false);
    setIs2FAModalOpen(false);
    setDisablePassword("");
  };

  const handleConfirm2FA = (action: "enable" | "disable") => {
    if (action === "enable") {
      setShowEnablePassword(true);
    }
  };

  const handleContinueEnablePassword = () => {
    setShowEnablePassword(false);
    setShowEnableOTP(true);
  };

  const handleEnableOTPChange = (index: number, value: string) => {
    if (value.match(/^[0-9]?$/)) {
      const newOTP = [...enableOTP];
      newOTP[index] = value;
      setEnableOTP(newOTP);

      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handleVerifyEnableOTP = () => {
    setShowEnableOTP(false);
    setShowEnableSuccess(true);
  };

  const handleEnableComplete = () => {
    setIs2FAEnabled(true);
    setShowEnablePassword(false);
    setShowEnableOTP(false);
    setShowEnableSuccess(false);
    setIs2FAModalOpen(false);
    setEnablePassword("");
    setEnableOTP(["", "", "", "", "", ""]);
  };

  const handleCancel2FA = () => {
    if (showEnableSuccess || showDisable2FASuccess) {
      setShowEnableSuccess(false);
      setShowDisable2FASuccess(false);
      setShowEnablePassword(false);
      setShowEnableOTP(false);
      setShowDisable2FAConfirm(false);
      setIs2FAModalOpen(false);
      setEnablePassword("");
      setDisablePassword("");
      setEnableOTP(["", "", "", "", "", ""]);
    } else if (showDisable2FAConfirm || showEnableOTP) {
      setShowDisable2FAConfirm(false);
      setShowEnableOTP(false);
      setDisablePassword("");
    } else if (showEnablePassword) {
      setShowEnablePassword(false);
      setEnablePassword("");
    } else {
      setIs2FAModalOpen(false);
    }
  };

  const SafariIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      width="20"
      height="20"
      className="shrink-0"
    >
      <defs>
        <radialGradient
          cx="57.025%"
          cy="39.017%"
          r="61.032%"
          id="safari-gradient"
        >
          <stop stopColor="#2ABCE1" offset="0%" />
          <stop stopColor="#3375F8" offset="100%" />
        </radialGradient>
      </defs>
      <circle fill="url(#safari-gradient)" cx="128" cy="128" r="120" />
      <path
        d="M192.372 85.628l-91.45 65.003 27.125 26.931 64.325-91.934"
        fill="#CD151E"
      />
      <path
        d="M111.019 150.438l13.66 13.465 77.693-78.275-91.353 64.81z"
        fill="#FA5153"
      />
      <path
        d="M111.019 150.438l27.125 26.93-91.45 65.004 64.325-91.935z"
        fill="#ACACAC"
      />
      <path
        d="M46.694 242.372l77.984-78.469-13.66-13.466-64.324 91.935z"
        fill="#EEE"
      />
    </svg>
  );

  const ChromeIcon = () => (
    <svg
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      className="shrink-0"
    >
      <path
        d="M4.7434,22.505A12.9769,12.9769,0,0,0,14.88,28.949l5.8848-10.1927L16,16.0058,11.2385,18.755l-1.5875-2.75L8.4885,13.9919,5.3553,8.5649A12.9894,12.9894,0,0,0,4.7434,22.505Z"
        fill="#00ac47"
      />
      <path
        d="M16,3.0072A12.9769,12.9769,0,0,0,5.3507,8.5636l5.8848,10.1927L16,16.0057V10.5072H27.766A12.99,12.99,0,0,0,16,3.0072Z"
        fill="#ea4435"
      />
      <path
        d="M27.2557,22.505a12.9772,12.9772,0,0,0,.5124-12H15.9986v5.5011l4.7619,2.7492-1.5875,2.75-1.1625,2.0135-3.1333,5.4269A12.99,12.99,0,0,0,27.2557,22.505Z"
        fill="#ffba00"
      />
      <circle cx="15.9995" cy="16.0072" fill="#ffffff" r="5.5" />
      <circle cx="15.9995" cy="16.0072" fill="#4285f4" r="4.25" />
    </svg>
  );

  const AppleIcon = () => (
    <svg
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      className="shrink-0"
      fill="#000000"
    >
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.38-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.12-.38C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8.905-.08 1.81-.78 2.99-.78 2.29 0 3.73 1.08 4.28 3.24-4.1 1.97-3.02 5.95-1.35 7.7 0 .01.01.01.01.02z" />
      <path d="M12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );

  return (
    <PanelLayout>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        {/* Secondary Sidebar - Desktop Only */}
        <div className="hidden md:block">
          <SettingsSidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          {/* Mobile Header */}
          <SettingsHeader />

          {/* Security Control Content */}
          <div className="p-4 md:p-6">
            {/* Security Control Tabs */}
            <div className="my-6 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center w-full p-1 rounded-lg bg-slate-200">
                <button
                  onClick={() => setActiveTab("2fa")}
                  className={`w-full h-full rounded-lg p-1 justify-center flex gap-2 items-center transition-colors ${
                    activeTab === "2fa"
                      ? "bg-khaki-200 shadow-sm"
                      : "bg-transparent"
                  }`}
                >
                  <span className="text-sm font-semibold">2FA</span>
                </button>
                <button
                  onClick={() => setActiveTab("password")}
                  className={`w-full h-full rounded-lg p-1 justify-center flex gap-2 items-center transition-colors ${
                    activeTab === "password"
                      ? "bg-khaki-200 shadow-sm"
                      : "bg-transparent"
                  }`}
                >
                  <span className="text-sm font-semibold">Password Management</span>
                </button>
                <button
                  onClick={() => setActiveTab("session")}
                  className={`w-full h-full rounded-lg p-1 justify-center flex gap-2 items-center transition-colors ${
                    activeTab === "session"
                      ? "bg-khaki-200 shadow-sm"
                      : "bg-transparent"
                  }`}
                >
                  <span className="text-sm font-semibold">Active Session</span>
                </button>
              </div>
            </div>

            {/* Settings Content */}
            <div className="space-y-6">
              {/* 2FA Tab Content */}
              {activeTab === "2fa" && (
                <div className="space-y-6">
                  {/* Two-Factor Authentication Card */}
                  <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <span className="text-3xl">🔐</span>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            Two-Factor Authentication (2FA)
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Add an extra layer of protection to your account
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleEdit2FA}
                        className="px-4 py-2 bg-khaki-200 text-gray-900 rounded-lg text-sm font-bold hover:bg-khaki-300 transition-colors whitespace-nowrap"
                      >
                        Edit 2FA
                      </button>
                    </div>
                  </div>

                  {/* Password Management Card */}
                  <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <span className="text-3xl">🔑</span>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            Password Management
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Update or reset your password to keep your account
                            secure
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setIsChangePasswordModalOpen(true)}
                        className="px-4 py-2 bg-khaki-200 text-gray-900 rounded-lg text-sm font-bold hover:bg-khaki-300 transition-colors whitespace-nowrap">
                        Change Password
                      </button>
                    </div>
                  </div>

                  {/* Active Session Card */}
                  <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                      <span className="text-3xl">💻</span>
                      <h3 className="text-lg font-bold text-gray-900">
                        Active Session
                      </h3>
                    </div>

                    <div className="overflow-x-auto">
                      <div className="min-w-full">
                        <div className="bg-slate-100 rounded-t-lg px-4 py-3 grid grid-cols-4 gap-4 text-xs font-bold text-gray-600">
                          <div>Device</div>
                          <div>Location</div>
                          <div>Last Active</div>
                          <div>Action</div>
                        </div>

                        <div className="divide-y divide-gray-100 border-x border-b border-gray-100 rounded-b-lg">
                          {sessions.map((session) => (
                            <div
                              key={session.id}
                              className="px-4 py-3 hover:bg-gray-50 transition-colors grid grid-cols-4 gap-4 items-center text-xs md:text-sm"
                            >
                              <div className="flex items-center gap-2 text-gray-700 font-medium">
                                {session.iconType === "safari" && (
                                  <SafariIcon />
                                )}
                                {session.iconType === "chrome" && (
                                  <ChromeIcon />
                                )}
                                {session.iconType === "apple" && <AppleIcon />}
                                <span>{session.device}</span>
                              </div>
                              <div className="text-gray-600">
                                {session.location}
                              </div>
                              <div className="text-gray-600">
                                {session.lastActive}
                              </div>
                              <div>
                                <button
                                  onClick={() =>
                                    handleTerminateClick(session.id)
                                  }
                                  className="px-3 py-1 bg-red-50 text-red-700 hover:bg-red-100 rounded text-xs font-bold transition-colors"
                                >
                                  Terminate
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Duplicate cards for other tabs as per original design but simplified */}
              {activeTab !== "2fa" && (
                <div className="flex flex-col items-center justify-center p-12 bg-white border border-gray-200 rounded-lg shadow-sm">
                   <p className="text-gray-500 font-medium">Content for {activeTab} goes here.</p>
                   <button onClick={() => setActiveTab("2fa")} className="mt-4 text-khaki-600 font-bold hover:underline">Back to 2FA</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Terminate Session Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200">
            <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
              Terminate Session
            </h2>
            <p className="text-gray-600 text-center text-sm mb-6">
              Are you sure you want to terminate this session? You will be logged out from that device.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleCancelTerminate}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-900 rounded-lg text-sm font-bold hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmTerminate}
                className="flex-1 px-4 py-2 bg-[#8B2A0F] text-white rounded-lg text-sm font-bold hover:bg-[#681c08] transition-colors"
              >
                Terminate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {isChangePasswordModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200">
            <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
              Change Password
            </h2>
            <p className="text-gray-600 text-center text-xs font-medium mb-6">
              Update password for enhanced account security
            </p>

            {passwordError && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg text-xs font-bold text-center">
                {passwordError}
              </div>
            )}

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  Current Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-khaki-400 placeholder:text-gray-300"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-khaki-400 placeholder:text-gray-300"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-khaki-400 placeholder:text-gray-300"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleClosePasswordModal}
                disabled={isSubmittingPassword}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-900 rounded-lg text-sm font-bold hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyPasswordChanges}
                disabled={isSubmittingPassword}
                className="flex-1 px-4 py-2 bg-[#8B2A0F] text-white rounded-lg text-sm font-bold hover:bg-[#681c08] transition-colors disabled:opacity-50"
              >
                {isSubmittingPassword ? "Updating..." : "Apply Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2FA Editing Modal */}
      {is2FAModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200">
            {/* Initial 2FA Choice Screen */}
            {!showDisable2FAConfirm &&
              !showDisable2FASuccess &&
              !showEnablePassword &&
              !showEnableOTP &&
              !showEnableSuccess && (
                <>
                  <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
                    Two-Factor Authentication
                  </h2>
                  <p className="text-gray-600 text-center text-sm font-medium mb-6">
                    Enhance your account security with 2FA
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={handleDisable2FA}
                      className="flex-1 px-4 py-2 bg-gray-100 text-gray-900 rounded-lg text-sm font-bold hover:bg-gray-200 transition-colors"
                    >
                      Disable
                    </button>
                    <button
                      onClick={() => handleConfirm2FA("enable")}
                      className="flex-1 px-4 py-2 bg-[#8B2A0F] text-white rounded-lg text-sm font-bold hover:bg-[#681c08] transition-colors"
                    >
                      Enable
                    </button>
                  </div>
                  <button onClick={handleCancel2FA} className="w-full mt-4 text-xs text-gray-400 font-bold hover:text-gray-600">Close</button>
                </>
              )}

            {/* Other states (Simplified for brevity as they follow similar pattern) */}
            {showEnablePassword && (
               <div className="space-y-4">
                  <h2 className="text-lg font-bold text-gray-900 text-center">Enter Password</h2>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={enablePassword}
                    onChange={(e) => setEnablePassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-khaki-400"
                  />
                  <div className="flex gap-2">
                    <button onClick={handleCancel2FA} className="flex-1 p-2 bg-gray-100 rounded-lg font-bold">Cancel</button>
                    <button onClick={handleContinueEnablePassword} className="flex-1 p-2 bg-khaki-200 rounded-lg font-bold">Continue</button>
                  </div>
               </div>
            )}

            {showEnableOTP && (
               <div className="space-y-4">
                  <h2 className="text-lg font-bold text-gray-900 text-center">Enter Code</h2>
                  <p className="text-xs text-gray-500 text-center">Enter the security code sent to your device.</p>
                  <div className="flex justify-center gap-2">
                    {enableOTP.map((digit, index) => (
                      <input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleEnableOTPChange(index, e.target.value)}
                        className="w-10 h-10 border border-gray-300 rounded-lg text-center font-bold focus:ring-2 focus:ring-khaki-400"
                      />
                    ))}
                  </div>
                  <button onClick={handleVerifyEnableOTP} className="w-full p-2 bg-khaki-200 rounded-lg font-bold">Verify</button>
               </div>
            )}

            {showEnableSuccess && (
               <div className="text-center space-y-4">
                  <div className="mx-auto w-12 h-12 bg-green-100 text-green-600 flex items-center justify-center rounded-full">✓</div>
                  <h2 className="text-lg font-bold">2FA Enabled</h2>
                  <button onClick={handleEnableComplete} className="w-full p-2 bg-khaki-200 rounded-lg font-bold">Done</button>
               </div>
            )}

            {showDisable2FAConfirm && (
                <div className="space-y-4">
                  <h2 className="text-lg font-bold text-red-600 text-center">Disable 2FA?</h2>
                  <p className="text-xs text-gray-500 text-center">This will make your account less secure.</p>
                  <div className="flex gap-2">
                    <button onClick={handleCancel2FA} className="flex-1 p-2 bg-gray-100 rounded-lg font-bold">Go Back</button>
                    <button onClick={handleConfirmDisable2FA} className="flex-1 p-2 bg-red-600 text-white rounded-lg font-bold">Disable</button>
                  </div>
                </div>
            )}

            {showDisable2FASuccess && (
               <div className="text-center space-y-4">
                  <h2 className="text-lg font-bold">2FA Disabled</h2>
                  <button onClick={handleDisable2FAComplete} className="w-full p-2 bg-khaki-200 rounded-lg font-bold">Done</button>
               </div>
            )}
          </div>
        </div>
      )}
    </PanelLayout>
  );
}