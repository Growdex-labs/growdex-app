"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Cable,
  CircleDollarSign,
  Loader2,
  Megaphone,
  ShieldCheck,
  Users,
} from "lucide-react";
import { PanelLayout } from "../components/panel-layout";
import { apiFetch } from "@/lib/auth";
import { useMe } from "@/context/me-context";

type AdminOverview = {
  totals: {
    users: number;
    campaigns: number;
    connections: number;
    spend: number;
  };
  campaignsByStatus: Record<string, number>;
  recentCampaigns: Array<{
    id: string;
    name: string;
    goal: string;
    status: string;
    creationMode: string | null;
    createdAt: string;
    ownerEmail: string | null;
    brandName: string | null;
  }>;
  generatedAt: string;
};

const STATUS_COLORS: Record<string, string> = {
  active: "bg-emerald-400",
  completed: "bg-blue-400",
  draft: "bg-amber-300",
  publishing: "bg-violet-400",
  under_review: "bg-sky-400",
  paused: "bg-gray-400",
  failed: "bg-red-400",
  rejected: "bg-rose-500",
};

export default function AdminDashboardPage() {
  const { me, isLoading: meLoading } = useMe();
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (meLoading || !me?.isAdmin) return;
    let active = true;
    void apiFetch("/users/admin/overview")
      .then(async (response) => {
        const body = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(
            typeof body.message === "string"
              ? body.message
              : `Admin overview failed (${response.status}).`,
          );
        }
        if (active) setOverview(body as AdminOverview);
      })
      .catch((failure) => {
        if (active) {
          setError(
            failure instanceof Error
              ? failure.message
              : "Could not load the admin dashboard.",
          );
        }
      })
    return () => {
      active = false;
    };
  }, [me?.isAdmin, meLoading]);
  const loading = meLoading || (Boolean(me?.isAdmin) && !overview && !error);

  const statusEntries = useMemo(
    () =>
      Object.entries(overview?.campaignsByStatus ?? {}).sort(
        ([, left], [, right]) => right - left,
      ),
    [overview?.campaignsByStatus],
  );
  const totalCampaignsByStatus = statusEntries.reduce(
    (total, [, count]) => total + count,
    0,
  );

  return (
    <PanelLayout>
      <div className="min-h-full bg-[#efefe9] p-4 sm:p-8 lg:p-10">
        <div className="mx-auto max-w-7xl">
          <header className="overflow-hidden rounded-[2rem] bg-gray-950 px-6 py-7 text-white shadow-xl sm:px-9 sm:py-9">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div>
                <div className="flex items-center gap-2 text-xs font-gilroy-semibold uppercase tracking-[0.18em] text-khaki-200">
                  <ShieldCheck className="size-4" /> Growdex operations
                </div>
                <h1 className="mt-3 text-3xl font-gilroy-bold sm:text-4xl">
                  Admin command center
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">
                  Account adoption, campaign health, and platform connections
                  across the product.
                </p>
              </div>
              {overview?.generatedAt && (
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/50">
                  Updated{" "}
                  {new Intl.DateTimeFormat(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(new Date(overview.generatedAt))}
                </div>
              )}
            </div>
          </header>

          {loading ? (
            <div className="mt-6 flex min-h-80 items-center justify-center rounded-[2rem] bg-white">
              <Loader2 className="size-8 animate-spin text-gray-400" />
            </div>
          ) : !me?.isAdmin ? (
            <div className="mt-6 rounded-[2rem] border border-red-200 bg-white p-8 text-red-700">
              Administrator access is required to view this page.
            </div>
          ) : error ? (
            <div className="mt-6 rounded-[2rem] border border-red-200 bg-white p-8 text-red-700">
              {error}
            </div>
          ) : overview ? (
            <>
              <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  {
                    label: "Users",
                    value: overview.totals.users.toLocaleString(),
                    Icon: Users,
                    tone: "bg-[#d9ff72]",
                  },
                  {
                    label: "Campaigns",
                    value: overview.totals.campaigns.toLocaleString(),
                    Icon: Megaphone,
                    tone: "bg-[#dcd7ff]",
                  },
                  {
                    label: "Ad connections",
                    value: overview.totals.connections.toLocaleString(),
                    Icon: Cable,
                    tone: "bg-[#ffd7b8]",
                  },
                  {
                    label: "Tracked spend",
                    value: new Intl.NumberFormat(undefined, {
                      style: "currency",
                      currency: "NGN",
                      maximumFractionDigits: 0,
                    }).format(overview.totals.spend),
                    Icon: CircleDollarSign,
                    tone: "bg-[#bce9ff]",
                  },
                ].map(({ label, value, Icon, tone }) => (
                  <article
                    key={label}
                    className="rounded-[1.5rem] border border-black/5 bg-white p-5 shadow-sm"
                  >
                    <span
                      className={`flex size-10 items-center justify-center rounded-xl ${tone}`}
                    >
                      <Icon className="size-5 text-gray-950" />
                    </span>
                    <p className="mt-6 text-xs font-gilroy-semibold uppercase tracking-[0.12em] text-gray-400">
                      {label}
                    </p>
                    <p className="mt-1 text-3xl font-gilroy-bold text-gray-950">
                      {value}
                    </p>
                  </article>
                ))}
              </section>

              <div className="mt-6 grid gap-6 xl:grid-cols-[0.75fr_1.5fr]">
                <section className="rounded-[2rem] bg-gray-950 p-6 text-white">
                  <div className="flex items-center gap-2">
                    <Activity className="size-5 text-khaki-200" />
                    <h2 className="font-gilroy-bold">Campaign health</h2>
                  </div>
                  <div className="mt-6 space-y-4">
                    {statusEntries.map(([status, count]) => {
                      const percent = totalCampaignsByStatus
                        ? (count / totalCampaignsByStatus) * 100
                        : 0;
                      return (
                        <div key={status}>
                          <div className="flex items-center justify-between text-sm">
                            <span className="capitalize text-white/65">
                              {status.replaceAll("_", " ")}
                            </span>
                            <span className="font-gilroy-semibold">{count}</span>
                          </div>
                          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                            <div
                              className={`h-full rounded-full ${STATUS_COLORS[status] ?? "bg-white/50"}`}
                              style={{ width: `${Math.max(percent, 3)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                    {!statusEntries.length && (
                      <p className="text-sm text-white/45">
                        No campaigns have been created.
                      </p>
                    )}
                  </div>
                </section>

                <section className="overflow-hidden rounded-[2rem] border border-black/5 bg-white shadow-sm">
                  <div className="border-b border-gray-100 px-6 py-5">
                    <h2 className="font-gilroy-bold text-gray-950">
                      Recent campaigns
                    </h2>
                    <p className="mt-1 text-xs text-gray-400">
                      The latest campaign activity across every account.
                    </p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                      <thead className="bg-gray-50 text-xs uppercase tracking-[0.08em] text-gray-400">
                        <tr>
                          <th className="px-6 py-3 font-gilroy-semibold">Campaign</th>
                          <th className="px-4 py-3 font-gilroy-semibold">Owner</th>
                          <th className="px-4 py-3 font-gilroy-semibold">Status</th>
                          <th className="px-6 py-3 font-gilroy-semibold">Created</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {overview.recentCampaigns.map((campaign) => (
                          <tr key={campaign.id}>
                            <td className="px-6 py-4">
                              <p className="font-gilroy-semibold text-gray-950">
                                {campaign.name}
                              </p>
                              <p className="mt-0.5 text-xs text-gray-400">
                                {campaign.goal.replaceAll("_", " ")} ·{" "}
                                {campaign.creationMode ?? "unknown"} setup
                              </p>
                            </td>
                            <td className="px-4 py-4">
                              <p className="text-gray-700">
                                {campaign.brandName ?? "No brand"}
                              </p>
                              <p className="mt-0.5 text-xs text-gray-400">
                                {campaign.ownerEmail ?? "Unknown owner"}
                              </p>
                            </td>
                            <td className="px-4 py-4">
                              <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs capitalize text-gray-700">
                                <span
                                  className={`size-2 rounded-full ${STATUS_COLORS[campaign.status] ?? "bg-gray-400"}`}
                                />
                                {campaign.status.replaceAll("_", " ")}
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-gray-500">
                              {new Intl.DateTimeFormat(undefined, {
                                dateStyle: "medium",
                              }).format(new Date(campaign.createdAt))}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </PanelLayout>
  );
}
