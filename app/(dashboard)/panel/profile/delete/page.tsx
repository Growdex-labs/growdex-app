"use client";

import { type JSX, useState } from "react";
import Link from "next/link";
import { PanelLayout } from "../../components/panel-layout";
import { DashboardHeader } from "../../components/dashboard-header";
import { ChevronLeft } from "lucide-react";
import { DepositIcon, DepositIcon2 } from "@/components/svg";

export default function DeleteAccountPage(): JSX.Element {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [userEmail] = useState("emmabuka@email.com");

  const profileData = {
    name: "Emma Ebuka",
    email: "emmabuka@email.com",
    isVerified: true,
    profileImage: "/profile.png",
  };

  const handleDeactivateClick = () => {
    setIsDeleteModalOpen(true);
    setShowDeleteConfirm(false);
    setShowDeleteSuccess(false);
  };

  const handleConfirmDelete = () => {
    setShowDeleteConfirm(true);
  };

  const handleContinueDeletePassword = () => {
    // Verify password logic here
    setShowDeleteConfirm(false);
    setShowDeleteSuccess(true);
  };

  const handleCancelDelete = () => {
    if (showDeleteSuccess) {
      setShowDeleteSuccess(false);
      setIsDeleteModalOpen(false);
      setDeletePassword("");
    } else if (showDeleteConfirm) {
      setShowDeleteConfirm(false);
      setDeletePassword("");
    } else {
      setIsDeleteModalOpen(false);
    }
  };

  const handleDeleteComplete = () => {
    setShowDeleteSuccess(false);
    setIsDeleteModalOpen(false);
    setDeletePassword("");
    // Redirect to login or home page after account deletion
  };

  return (
    <PanelLayout>
      <div className="flex-1 overflow-auto h-screen bg-gray-200">
        <div className="p-4 md:p-6 flex flex-col h-full">
          {/* Main Content */}
          {/* Header Section */}
          <div className="px-4 md:px-6 py-6 md:py-8 bg-white rounded-lg shadow-sm mb-6">
            <div className="flex items-center gap-2 mb-6">
              <Link
                href="/panel/profile"
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Profile
              </h1>
            </div>

            <div>
              <div className="flex gap-4 items-start">
                <img
                  src={profileData.profileImage}
                  alt="Profile"
                  className="w-24 h-24 md:w-28 md:h-28 rounded-lg object-cover bg-gray-100"
                />
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                    {profileData.name}
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">
                    {profileData.email}
                  </p>
                  {profileData.isVerified && (
                    <span className="inline-block mt-2 px-3 py-1 bg-khaki-300/10 text-khaki-200 text-xs font-semibold rounded-full">
                      ✓ Verified User
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
            Delete Account
          </h2>
          {/* Delete Account Content */}
          <div className="flex-1">
            {/* Account Deactivation Card */}
            <div className="bg-gray-50 flex flex-col rounded-lg p-6 md:p-8 h-full">
              <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-6 border-b-4 border-khaki-300/40 pb-2 w-fit ">
                Account Deactivation
              </h3>
              <p className="text-gray-600 text-sm md:text-base mb-6">
                Are you sure about deactivating your account?
              </p>

              <button
                onClick={handleDeactivateClick}
                className="px-6 py-2 bg-yellow-300 hover:bg-yellow-400 text-gray-900 flex gap-2 font-semibold rounded-lg transition-colors text-sm w-fit"
              >
                Deactivate
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Modal - Modal Template */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-slate-200/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6">
            {/* Initial Delete Account Screen */}
            {!showDeleteConfirm && !showDeleteSuccess && (
              <>
                <h2 className="text-xl font-bold text-gray-900 text-center mb-4">
                  Delete Account
                </h2>
                <p className="text-gray-600 text-center mb-6 text-sm">
                  Are you sure you want to permanently delete your account? This
                  action cannot be undone.
                </p>

                {/* Personal Details Summary */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-3">
                  <div>
                    <p className="text-xs text-gray-600 font-medium mb-1">
                      Name
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {profileData.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-medium mb-1">
                      Email Address
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {profileData.email}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleCancelDelete}
                    className="flex-1 px-4 py-2 bg-khaki-200 text-gray-900 rounded-lg flex gap-2 items-center justify-center text-sm font-medium hover:bg-khaki-300 transition-colors"
                  >
                    <DepositIcon />
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmDelete}
                    className="flex-1 px-4 py-2 bg-red-700 text-white rounded-lg flex gap-2 items-center justify-center text-sm font-medium hover:bg-red-800 transition-colors"
                  >
                    <DepositIcon2 />
                    Delete Account
                  </button>
                </div>
              </>
            )}

            {/* Password Confirmation Screen */}
            {showDeleteConfirm && !showDeleteSuccess && (
              <>
                <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
                  Delete Account
                </h2>
                <p className="text-gray-600 text-center text-sm mb-6">
                  To continue, please enter your password. This will permanently
                  delete your account.
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
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleCancelDelete}
                    className="flex-1 px-4 py-2 bg-khaki-200 text-gray-900 rounded-lg text-sm font-medium hover:bg-khaki-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleContinueDeletePassword}
                    className="flex-1 px-4 py-2 bg-red-700 text-white rounded-lg text-sm font-medium hover:bg-red-800 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}

            {/* Delete Success Screen */}
            {showDeleteSuccess && (
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

                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Account Deleted
                </h2>
                <p className="text-gray-600 text-sm mb-6">
                  Your account has been successfully deleted. You will be
                  redirected to the home page.
                </p>

                <button
                  onClick={handleDeleteComplete}
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
