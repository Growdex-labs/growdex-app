"use client";

import { type JSX, useMemo } from "react";
import Link from "next/link";
import { PanelLayout } from "../components/panel-layout";
import { DashboardHeader } from "../components/dashboard-header";
import {
  Edit2,
  Copy,
  Facebook,
  Instagram,
  Linkedin,
  Trash2,
} from "lucide-react";
import { useMe } from "@/context/me-context";

export default function MyProfilePage(): JSX.Element {
  const { me, isLoading } = useMe();

  const profileData = useMemo(() => {
    const name =
      me?.profile?.firstName && me?.profile?.lastName
        ? `${me.profile.firstName} ${me.profile.lastName}`
        : (me?.email ?? "Account");

    const linkedAccounts = [
      {
        id: 1,
        platform: "Facebook",
        icon: "facebook",
        url: me?.brand?.facebookUrl ?? "",
      },
      {
        id: 2,
        platform: "Instagram",
        icon: "instagram",
        url: me?.brand?.instagramUrl ?? "",
      },
      {
        id: 3,
        platform: "Google",
        icon: "linkedin",
        url: me?.brand?.googleUrl ?? "",
      },
    ].filter((a) => Boolean(a.url));

    const registrationDate = me?.brand?.createdAt
      ? new Date(me.brand.createdAt).toLocaleDateString(undefined, {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "—";

    return {
      name,
      email: me?.email ?? "",
      profileImage: "/profile.png",
      linkedAccounts,
      personalDetails: {
        firstName: me?.profile?.firstName ?? "—",
        lastName: me?.profile?.lastName ?? "—",
        phoneNumber: me?.profile?.phone ?? "—",
        email: me?.email ?? "—",
        gender: "—",
        country: me?.profile?.country ?? "—",
        language: "—",
      },
      brandDetails: {
        brandName: me?.brand?.name ?? "—",
        brandAddress: me?.brand?.businessAddress ?? "—",
        registrationDate,
      },
    };
  }, [me]);

  return (
    <PanelLayout>
      <div className="flex-1 overflow-auto bg-gray-50">
        <div className="p-4 md:p-6">
          {/* Desktop Header */}
          <div className="hidden md:block mb-6">
            <DashboardHeader />
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-lg shadow-sm">
            {/* Header Section */}
            <div className="px-4 md:px-6 py-6 md:py-8 border-b border-gray-200">
              <div className="text-sm text-gray-600 mb-4">
                <span className="text-gray-900 font-medium">My Profile</span>
                <span className="mx-2 text-gray-400">&gt;</span>
                <span className="text-gray-500">Edit Profile</span>
              </div>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                {/* Breadcrumb and Profile Info */}
                <div>
                  <div className="flex gap-4 items-start">
                    <img
                      src={profileData.profileImage}
                      alt="Profile"
                      className="w-24 h-24 md:w-28 md:h-28 rounded-lg object-cover bg-gray-100"
                    />
                    <div>
                      <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                        {isLoading ? "Loading…" : profileData.name}
                      </h1>
                      <p className="text-sm text-gray-600 mt-1">
                        {profileData.email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Linked Accounts Section */}
                <div className="border-l-3 border-gray-300  md:min-w-max md:mr-40">
                  <div className="ml-4">
                    <h3 className=" text-sm font-semibold text-gray-900 mb-3">
                      Linked accounts
                    </h3>
                    <div className="space-y-2">
                      {profileData.linkedAccounts.map((account) => {
                        const iconMap: Record<string, JSX.Element> = {
                          facebook: (
                            <Facebook className="w-4 h-4 text-blue-600" />
                          ),
                          instagram: (
                            <Instagram className="w-4 h-4 text-pink-600" />
                          ),
                          linkedin: (
                            <Linkedin className="w-4 h-4 text-blue-700" />
                          ),
                        };

                        return (
                          <div
                            key={account.id}
                            className="flex items-center justify-between gap-3 bg-gray-50 px-3 py-2 rounded-lg"
                          >
                            {iconMap[account.icon]}
                            <a
                              href={account.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:text-blue-700 truncate flex-1"
                            >
                              {account.url}
                            </a>
                            <button
                              onClick={() =>
                                navigator.clipboard.writeText(account.url)
                              }
                              className="px-2.5 py-1 bg-yellow-300 hover:bg-yellow-400 text-gray-900 font-semibold rounded text-xs whitespace-nowrap transition-colors"
                            >
                              Share URL
                            </button>
                          </div>
                        );
                      })}
                      <button className="w-full text-start text-yellow-600 hover:text-yellow-700 font-medium text-xs py-2">
                        + add account
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Overview Section */}
            <div className="px-4 md:px-6 py-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-900">
                  Profile Overview
                </h2>
                <div className="flex items-center gap-4">
                  <Link
                    href="/panel/profile/edit"
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-300 hover:bg-yellow-400 text-gray-900 font-semibold rounded-lg transition-colors text-sm"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/panel/profile/delete"
                    className="flex items-center gap-2 px-4 py-2 bg-red-300 hover:bg-red-400 text-red-900 font-semibold rounded-lg transition-colors text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Personal and Brand Details Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Personal Details */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-6">
                    Personal Details
                  </h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs text-gray-600 font-medium mb-1">
                        First Name
                      </p>
                      <p className="text-sm md:text-base font-semibold text-gray-900">
                        {profileData.personalDetails.firstName}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-medium mb-1">
                        Last Name
                      </p>
                      <p className="text-sm md:text-base font-semibold text-gray-900">
                        {profileData.personalDetails.lastName}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-medium mb-1">
                        Phone Number
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-linear-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                          O
                        </div>
                        <p className="text-sm md:text-base font-semibold text-gray-900">
                          {profileData.personalDetails.phoneNumber}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-medium mb-1">
                        Email Address
                      </p>
                      <p className="text-sm md:text-base font-semibold text-gray-900">
                        {profileData.personalDetails.email}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-medium mb-1">
                        Gender
                      </p>
                      <p className="text-sm md:text-base font-semibold text-gray-900">
                        {profileData.personalDetails.gender}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-medium mb-1">
                        Country
                      </p>
                      <p className="text-sm md:text-base font-semibold text-gray-900">
                        {profileData.personalDetails.country}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-medium mb-1">
                        Language
                      </p>
                      <p className="text-sm md:text-base font-semibold text-gray-900">
                        {profileData.personalDetails.language}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Brand Details */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-6">
                    Brand Details
                  </h3>
                  <div className="space-y-6">
                    <div>
                      <p className="text-xs text-gray-600 font-medium mb-2">
                        Brand Name
                      </p>
                      <p className="text-sm md:text-base font-semibold text-gray-900">
                        {profileData.brandDetails.brandName}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-medium mb-2">
                        Brand Address
                      </p>
                      <p className="text-sm md:text-base font-semibold text-gray-900">
                        {profileData.brandDetails.brandAddress}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-medium mb-2">
                        Brand Registration Date
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-linear-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                          A
                        </div>
                        <p className="text-sm md:text-base font-semibold text-gray-900">
                          {profileData.brandDetails.registrationDate}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PanelLayout>
  );
}
