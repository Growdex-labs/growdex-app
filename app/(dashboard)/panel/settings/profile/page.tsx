"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { PanelLayout } from "../../components/panel-layout";
import { SettingsSidebar } from "../../components/settings-sidebar";
import { SettingsHeader } from "../components/settings-header";
import { useMe } from "@/context/me-context";

function SettingRow({
  label,
  value,
  loading,
}: {
  label: string;
  value: string;
  loading: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-gray-100 py-3 last:border-b-0">
      <dt className="text-sm text-gray-500">{label}</dt>
      <dd className="min-w-0 truncate text-sm font-gilroy-semibold text-gray-900">
        {loading ? "Loading…" : value}
      </dd>
    </div>
  );
}

export default function ProfileSettingsPage() {
  const { me, isLoading } = useMe();

  const name =
    me?.profile?.firstName && me?.profile?.lastName
      ? `${me.profile.firstName} ${me.profile.lastName}`
      : "Not set";
  const accountType = me?.isAdmin ? "Admin" : "Standard";

  return (
    <PanelLayout>
      <div className="flex h-full overflow-hidden bg-gray-50">
        <div className="hidden md:block">
          <SettingsSidebar />
        </div>

        <div className="flex-1 overflow-auto">
          <SettingsHeader />

          <div className="space-y-4 p-4 md:p-6">
            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm lg:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <h2 className="font-gilroy-semibold text-gray-950">Profile</h2>
                <Link
                  href="/panel/profile/edit"
                  className="rounded-lg bg-khaki-200 px-4 py-2 text-sm font-gilroy-semibold text-gray-950 hover:bg-khaki-300"
                >
                  Edit Profile
                </Link>
              </div>
              <dl className="mt-4">
                <SettingRow label="Name" value={name} loading={isLoading} />
                <SettingRow
                  label="Email"
                  value={me?.email ?? "Not set"}
                  loading={isLoading}
                />
              </dl>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm lg:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <h2 className="font-gilroy-semibold text-gray-950">Account</h2>
                <Link
                  href="/panel/profile"
                  className="rounded-lg bg-khaki-200 px-4 py-2 text-sm font-gilroy-semibold text-gray-950 hover:bg-khaki-300"
                >
                  Edit Account
                </Link>
              </div>
              <dl className="mt-4">
                <SettingRow
                  label="Account Type"
                  value={accountType}
                  loading={isLoading}
                />
                <SettingRow
                  label="Business"
                  value={me?.brand?.name ?? "Not set"}
                  loading={isLoading}
                />
              </dl>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm lg:p-6">
              <h2 className="font-gilroy-semibold text-gray-950">
                Connected Accounts
              </h2>
              <p className="mt-1 text-sm leading-6 text-gray-500">
                Manage the advertising platforms connected to Growdex.
              </p>
              <Link
                href="/panel/integrations"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-gilroy-semibold text-peru-200 hover:underline"
              >
                Go to Integrations <ChevronRight className="size-4" />
              </Link>
            </section>

            <section className="rounded-2xl border border-red-200 bg-red-50 p-5 lg:p-6">
              <h2 className="font-gilroy-semibold text-red-800">Danger Zone</h2>
              <p className="mt-2 text-sm leading-6 text-red-700">
                Permanently delete your Growdex account and associated data.
              </p>
              <Link
                href="/panel/profile/delete"
                className="mt-4 inline-flex rounded-lg bg-[#8B2A0F] px-4 py-2.5 text-sm font-gilroy-semibold text-white hover:bg-[#681c08]"
              >
                Delete Account
              </Link>
            </section>
          </div>
        </div>
      </div>
    </PanelLayout>
  );
}
