"use client";

import React, { useState } from "react";
import { PanelLayout } from "../../components/panel-layout";
import { SettingsSidebar } from "../../components/settings-sidebar";
import { SettingsHeader } from "../components/settings-header";
import { useMe } from "@/context/me-context";

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
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [showDisable2FAConfirm, setShowDisable2FAConfirm] = useState(false);
  const [showDisable2FASuccess, setShowDisable2FASuccess] = useState(false);
  const [showEnablePassword, setShowEnablePassword] = useState(false);
  const [showEnableOTP, setShowEnableOTP] = useState(false);
  const [showEnableSuccess, setShowEnableSuccess] = useState(false);
  const [disablePassword, setDisablePassword] = useState("");
  const [enablePassword, setEnablePassword] = useState("");
  const [enableOTP, setEnableOTP] = useState(["", "", "", "", "", "", ""]);
  const userEmail = me?.email ?? "";

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
      if (value && index < 6) {
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
    setEnableOTP(["", "", "", "", "", "", ""]);
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
      setEnableOTP(["", "", "", "", "", "", ""]);
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
                  <span className="text-sm">2FA</span>
                </button>
                <button
                  onClick={() => setActiveTab("password")}
                  className={`w-full h-full rounded-lg p-1 justify-center flex gap-2 items-center transition-colors ${
                    activeTab === "password"
                      ? "bg-khaki-200 shadow-sm"
                      : "bg-transparent"
                  }`}
                >
                  <span className="text-sm">Password Management</span>
                </button>
                <button
                  onClick={() => setActiveTab("session")}
                  className={`w-full h-full rounded-lg p-1 justify-center flex gap-2 items-center transition-colors ${
                    activeTab === "session"
                      ? "bg-khaki-200 shadow-sm"
                      : "bg-transparent"
                  }`}
                >
                  <span className="text-sm">Active Session</span>
                </button>
              </div>
            </div>

            {/* Settings Content */}
            <div className="space-y-6">
              {/* 2FA Tab Content */}
              {activeTab === "2fa" && (
                <div className="space-y-6">
                  {/* Two-Factor Authentication Card */}
                  <div className="border-2 border-khaki-200 rounded-lg p-6 bg-white">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <span className="text-3xl">🔐</span>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Two-Factor Authentication (2FA)
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Add an extra layer of protection to your account
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleEdit2FA}
                        className="px-4 py-2 bg-khaki-200 text-gray-900 rounded-lg text-sm font-medium hover:bg-khaki-300 transition-colors whitespace-nowrap"
                      >
                        Edit 2FA
                      </button>
                    </div>
                  </div>

                  {/* Password Management Card */}
                  <div className="border-2 border-khaki-200 rounded-lg p-6 bg-white">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <span className="text-3xl">🔑</span>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Password Management
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Update or reset your password to keep your account
                            secure
                          </p>
                        </div>
                      </div>
                      <button className="px-4 py-2 bg-khaki-200 text-gray-900 rounded-lg text-sm font-medium hover:bg-khaki-300 transition-colors whitespace-nowrap">
                        Change Password
                      </button>
                    </div>
                  </div>

                  {/* Active Session Card */}
                  <div className="border-2 border-khaki-200 rounded-lg p-6 bg-white">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-3xl">💻</span>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Active Session
                      </h3>
                    </div>

                    {/* Session Table */}
                    <div className="overflow-x-auto">
                      <div className="min-w-full">
                        {/* Header */}
                        <div className="bg-khaki-200 rounded-t-lg px-4 py-3 grid grid-cols-4 gap-4 text-xs md:text-sm font-semibold text-gray-700">
                          <div>Device</div>
                          <div>Location</div>
                          <div>Last Active</div>
                          <div>Action</div>
                        </div>

                        {/* Items */}
                        <div className="divide-y divide-gray-200 border border-t-0 border-gray-200 rounded-b-lg">
                          {sessions.map((session) => (
                            <div
                              key={session.id}
                              className="px-4 py-3 hover:bg-gray-50 transition-colors grid grid-cols-4 gap-4 items-center text-xs md:text-sm"
                            >
                              <div className="flex items-center gap-2 text-gray-700">
                                {session.iconType === "safari" && (
                                  <SafariIcon />
                                )}
                                {session.iconType === "chrome" && (
                                  <ChromeIcon />
                                )}
                                {session.iconType === "apple" && <AppleIcon />}
                                <span>{session.device}</span>
                              </div>
                              <div className="text-gray-700">
                                {session.location}
                              </div>
                              <div className="text-gray-700">
                                {session.lastActive}
                              </div>
                              <div>
                                <button
                                  onClick={() =>
                                    handleTerminateClick(session.id)
                                  }
                                  className="px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded text-xs font-medium transition-colors whitespace-nowrap"
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

              {/* Password Management Tab Content */}
              {activeTab === "password" && (
                <div className="space-y-6">
                  {/* Two-Factor Authentication Card */}
                  <div className="border-2 border-khaki-200 rounded-lg p-6 bg-white">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <span className="text-3xl">🔐</span>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Two-Factor Authentication (2FA)
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Add an extra layer of protection to your account
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleEdit2FA}
                        className="px-4 py-2 bg-khaki-200 text-gray-900 rounded-lg text-sm font-medium hover:bg-khaki-300 transition-colors whitespace-nowrap"
                      >
                        Edit 2FA
                      </button>
                    </div>
                  </div>

                  {/* Password Management Card */}
                  <div className="border-2 border-khaki-200 rounded-lg p-6 bg-white">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <span className="text-3xl">🔑</span>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Password Management
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Update or reset your password to keep your account
                            secure
                          </p>
                        </div>
                      </div>
                      <button className="px-4 py-2 bg-khaki-200 text-gray-900 rounded-lg text-sm font-medium hover:bg-khaki-300 transition-colors whitespace-nowrap">
                        Change Password
                      </button>
                    </div>
                  </div>

                  {/* Active Session Card */}
                  <div className="border-2 border-khaki-200 rounded-lg p-6 bg-white">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-3xl">💻</span>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Active Session
                      </h3>
                    </div>

                    {/* Session Table */}
                    <div className="overflow-x-auto">
                      <div className="min-w-full">
                        {/* Header */}
                        <div className="bg-khaki-200 rounded-t-lg px-4 py-3 grid grid-cols-4 gap-4 text-xs md:text-sm font-semibold text-gray-700">
                          <div>Device</div>
                          <div>Location</div>
                          <div>Last Active</div>
                          <div>Action</div>
                        </div>

                        {/* Items */}
                        <div className="divide-y divide-gray-200 border border-t-0 border-gray-200 rounded-b-lg">
                          {sessions.map((session) => (
                            <div
                              key={session.id}
                              className="px-4 py-3 hover:bg-gray-50 transition-colors grid grid-cols-4 gap-4 items-center text-xs md:text-sm"
                            >
                              <div className="flex items-center gap-2 text-gray-700">
                                {session.iconType === "safari" && (
                                  <SafariIcon />
                                )}
                                {session.iconType === "chrome" && (
                                  <ChromeIcon />
                                )}
                                {session.iconType === "apple" && <AppleIcon />}
                                <span>{session.device}</span>
                              </div>
                              <div className="text-gray-700">
                                {session.location}
                              </div>
                              <div className="text-gray-700">
                                {session.lastActive}
                              </div>
                              <div>
                                <button
                                  onClick={() =>
                                    handleTerminateClick(session.id)
                                  }
                                  className="px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded text-xs font-medium transition-colors whitespace-nowrap"
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

              {/* Active Session Tab Content */}
              {activeTab === "session" && (
                <div className="space-y-6">
                  {/* Two-Factor Authentication Card */}
                  <div className="border-2 border-khaki-200 rounded-lg p-6 bg-white">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <span className="text-3xl">🔐</span>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Two-Factor Authentication (2FA)
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Add an extra layer of protection to your account
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleEdit2FA}
                        className="px-4 py-2 bg-khaki-200 text-gray-900 rounded-lg text-sm font-medium hover:bg-khaki-300 transition-colors whitespace-nowrap"
                      >
                        Edit 2FA
                      </button>
                    </div>
                  </div>

                  {/* Password Management Card */}
                  <div className="border-2 border-khaki-200 rounded-lg p-6 bg-white">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <span className="text-3xl">🔑</span>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Password Management
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Update or reset your password to keep your account
                            secure
                          </p>
                        </div>
                      </div>
                      <button className="px-4 py-2 bg-khaki-200 text-gray-900 rounded-lg text-sm font-medium hover:bg-khaki-300 transition-colors whitespace-nowrap">
                        Change Password
                      </button>
                    </div>
                  </div>

                  {/* Active Session Card */}
                  <div className="border-2 border-khaki-200 rounded-lg sm:p-6 bg-white">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-3xl">💻</span>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Active Session
                      </h3>
                    </div>

                    {/* Session Table */}
                    <div className="overflow-x-auto">
                      <div className="min-w-full">
                        {/* Header */}
                        <div className="bg-khaki-200 rounded-t-lg px-4 py-3 grid grid-cols-4 gap-4 text-xs md:text-sm font-semibold text-gray-700">
                          <div>Device</div>
                          <div>Location</div>
                          <div>Last Active</div>
                          <div>Action</div>
                        </div>

                        {/* Items */}
                        <div className="divide-y divide-gray-200 border border-t-0 border-gray-200 rounded-b-lg">
                          {sessions.map((session) => (
                            <div
                              key={session.id}
                              className="px-4 py-3 hover:bg-gray-50 transition-colors grid grid-cols-4 gap-4 items-center text-xs md:text-sm"
                            >
                              <div className="flex items-center gap-2 text-gray-700">
                                {session.iconType === "safari" && (
                                  <SafariIcon />
                                )}
                                {session.iconType === "chrome" && (
                                  <ChromeIcon />
                                )}
                                {session.iconType === "apple" && <AppleIcon />}
                                <span className="whitespace-nowrap">
                                  {session.device}
                                </span>
                              </div>
                              <div className="text-gray-700">
                                {session.location}
                              </div>
                              <div className="text-gray-700">
                                {session.lastActive}
                              </div>
                              <div>
                                <button
                                  onClick={() =>
                                    handleTerminateClick(session.id)
                                  }
                                  className="px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded text-xs font-medium transition-colors whitespace-nowrap"
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
            </div>
          </div>
        </div>
      </div>

      {/* Terminate Session Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-200/30  flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 text-center mb-4">
              Terminate Session
            </h2>
            <p className="text-gray-600 text-center mb-6">
              Do you want to terminate session?
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleCancelTerminate}
                className="flex-1 px-4 py-2 bg-khaki-200 text-gray-900 rounded-lg text-sm font-medium hover:bg-khaki-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmTerminate}
                className="flex-1 px-4 py-2 bg-red-700 text-white rounded-lg text-sm font-medium hover:bg-red-800 transition-colors"
              >
                Terminate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Two-Factor Authentication Modal - Single Modal with Dynamic Content */}
      {is2FAModalOpen && (
        <div className="fixed inset-0 bg-slate-200/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6">
            {/* Initial 2FA Choice Screen */}
            {!showDisable2FAConfirm &&
              !showDisable2FASuccess &&
              !showEnablePassword &&
              !showEnableOTP &&
              !showEnableSuccess && (
                <>
                  <h2 className="text-xl font-bold text-gray-900 text-center mb-4">
                    Two-Factor Authentication (2FA)
                  </h2>
                  <p className="text-gray-600 text-center mb-6">
                    Do you want to add an extra layer of protection to your
                    account?
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={handleDisable2FA}
                      className="flex-1 px-4 py-2 bg-khaki-200 text-gray-900 rounded-lg text-sm font-medium hover:bg-khaki-300 transition-colors"
                    >
                      Disable 2FA
                    </button>
                    <button
                      onClick={() => handleConfirm2FA("enable")}
                      className="flex-1 px-4 py-2 bg-red-700 text-white rounded-lg text-sm font-medium hover:bg-red-800 transition-colors"
                    >
                      Enable 2FA
                    </button>
                  </div>
                </>
              )}

            {/* Enable Password Screen */}
            {showEnablePassword && !showEnableOTP && !showEnableSuccess && (
              <>
                <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
                  Enable Two-Factor Authentication (2FA)
                </h2>
                <p className="text-gray-600 text-center text-sm mb-6">
                  To continue, please enter your password. This will enable
                  two-factor authentication
                </p>

                {/* Email Address Field */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={userEmail}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 text-sm"
                  />
                </div>

                {/* Password Field */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={enablePassword}
                    onChange={(e) => setEnablePassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-khaki-200"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleCancel2FA}
                    className="flex-1 px-4 py-2 bg-khaki-200 text-gray-900 rounded-lg text-sm font-medium hover:bg-khaki-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleContinueEnablePassword}
                    className="flex-1 px-4 py-2 bg-red-700 text-white rounded-lg text-sm font-medium hover:bg-red-800 transition-colors"
                  >
                    Continue
                  </button>
                </div>
              </>
            )}

            {/* Enable OTP Screen */}
            {showEnableOTP && !showEnableSuccess && (
              <>
                <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
                  Enable Two-Factor Authentication (2FA)
                </h2>
                <p className="text-gray-600 text-center text-sm mb-6">
                  Enter the the authentication code we sent to your email
                </p>

                {/* OTP Input Fields */}
                <div className="flex justify-center gap-2 mb-4">
                  {enableOTP.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) =>
                        handleEnableOTPChange(index, e.target.value)
                      }
                      className="w-10 h-10 border border-gray-300 rounded-lg text-center text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-khaki-200"
                    />
                  ))}
                </div>

                {/* Resend Code Link */}
                <div className="text-center mb-6">
                  <button className="text-red-700 text-sm font-medium hover:underline">
                    Resend Code
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleCancel2FA}
                    className="flex-1 px-4 py-2 bg-khaki-200 text-gray-900 rounded-lg text-sm font-medium hover:bg-khaki-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleVerifyEnableOTP}
                    className="flex-1 px-4 py-2 bg-red-700 text-white rounded-lg text-sm font-medium hover:bg-red-800 transition-colors"
                  >
                    Verify
                  </button>
                </div>
              </>
            )}

            {/* Disable 2FA Confirmation Screen */}
            {showDisable2FAConfirm && !showDisable2FASuccess && (
              <>
                <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
                  Disable Two-Factor Authentication (2FA)
                </h2>
                <p className="text-gray-600 text-center text-sm mb-6">
                  To continue, please enter your password. This will disable
                  two-factor authentication entirely
                </p>

                {/* Email Address Field */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={userEmail}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 text-sm"
                  />
                </div>

                {/* Password Field */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={disablePassword}
                    onChange={(e) => setDisablePassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-khaki-200"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleCancel2FA}
                    className="flex-1 px-4 py-2 bg-khaki-200 text-gray-900 rounded-lg text-sm font-medium hover:bg-khaki-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmDisable2FA}
                    className="flex-1 px-4 py-2 bg-red-700 text-white rounded-lg text-sm font-medium hover:bg-red-800 transition-colors"
                  >
                    Disable 2FA
                  </button>
                </div>
              </>
            )}

            {/* Enable Success Screen */}
            {showEnableSuccess && (
              <div className="text-center">
                {/* Success Checkmark Icon */}
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-red-700 rounded-full flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>

                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Two-Factor authentication successfully enabled
                </h2>

                <button
                  onClick={handleEnableComplete}
                  className="w-full px-4 py-2 bg-khaki-200 text-gray-900 rounded-lg text-sm font-medium hover:bg-khaki-300 transition-colors"
                >
                  Done
                </button>
              </div>
            )}

            {/* Disable Success Screen */}
            {showDisable2FASuccess && (
              <div className="text-center">
                {/* Success Checkmark Icon */}
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-red-700 rounded-full flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>

                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Two-Factor authentication disabled
                </h2>

                <button
                  onClick={handleDisable2FAComplete}
                  className="w-full px-4 py-2 bg-khaki-200 text-gray-900 rounded-lg text-sm font-medium hover:bg-khaki-300 transition-colors"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </PanelLayout>
  );
}
