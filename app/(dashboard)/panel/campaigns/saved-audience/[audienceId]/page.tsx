"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

import { PanelLayout } from "../../../components/panel-layout";
import { CampaignsSidebar } from "../../../components/campaigns-sidebar";
import { CampaignsMobileHeader } from "../../../components/campaigns-mobile-header";
import { fetchAudienceById, updateAudience, Audience } from "@/lib/audiences";

type AudienceTab = "meta" | "tiktok";

function TagPill({ label }: { label: string }) {
  return (
    <div className="px-3 py-1 rounded-full bg-gray-200/60 text-xs text-gray-700 flex items-center gap-2 w-fit">
      <span className="leading-none">{label}</span>
      <span className="text-gray-500 leading-none">×</span>
    </div>
  );
}

export default function SavedAudienceDetailPage({
  params,
}: {
  params: Promise<{ audienceId: string }>;
}) {
  const router = useRouter();
  const { audienceId } = use(params);
  const [audience, setAudience] = useState<Audience | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<AudienceTab>("meta");

  useEffect(() => {
    const loadAudience = async () => {
      try {
        setLoading(true);
        const data = await fetchAudienceById(audienceId);
        setAudience(data);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch audience",
        );
        setAudience(null);
      } finally {
        setLoading(false);
      }
    };

    loadAudience();
  }, [audienceId]);

  const handleSave = async () => {
    if (!audience) return;

    try {
      setSaving(true);
      const updated = await updateAudience(audience.id, {
        name: audience.name,
        country: audience.country,
        locations: audience.locations,
        interests: audience.interests,
        platforms: audience.platforms,
        metaConfig: audience.metaConfig,
        tiktokConfig: audience.tiktokConfig,
      });
      setAudience(updated);
      alert("Audience updated successfully!");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update audience");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PanelLayout>
        <div className="flex h-screen items-center justify-center">
          <div className="text-gray-500">Loading audience details...</div>
        </div>
      </PanelLayout>
    );
  }

  if (error || !audience) {
    return (
      <PanelLayout>
        <div className="flex h-screen items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Audience Not Found
            </h1>
            <p className="text-gray-600 mb-6">
              {error || "The audience you are looking for does not exist."}
            </p>
            <button
              onClick={() => router.push("/panel/campaigns/saved-audience")}
              className="px-4 py-2 bg-khaki-200 text-gray-900 rounded-lg hover:bg-khaki-300 transition"
            >
              Back to Saved Audiences
            </button>
          </div>
        </div>
      </PanelLayout>
    );
  }

  return (
    <PanelLayout>
      <div className="flex h-screen">
        <div className="hidden md:block">
          <CampaignsSidebar />
        </div>

        <div className="flex-1 overflow-auto hide-scrollbar flex flex-col">
          <CampaignsMobileHeader />

          <div className="flex-1 overflow-auto hide-scrollbar p-4 md:p-8">
            <div className="bg-white rounded-xl p-6">
              {/* Breadcrumb */}
              <div className="text-xs text-gray-500 mb-2">
                <span
                  className="cursor-pointer hover:underline"
                  onClick={() => router.push("/panel/campaigns")}
                >
                  All campaigns
                </span>
                <span className="mx-1 text-xs">&gt;&gt;</span>
                <span
                  className="cursor-pointer hover:underline"
                  onClick={() => router.push("/panel/campaigns/saved-audience")}
                >
                  Saved Audiences
                </span>
                <span className="mx-1 text-xs">&gt;&gt;</span>
                <span className="text-gray-900">{audience.name}</span>
              </div>

              {/* Header */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  {audience.name}
                </h1>

                <div className="text-right">
                  <div className="text-xs text-gray-400">Total reach</div>
                  <div className="text-lg font-bold text-gray-900">
                    25,000-50,000k
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="relative mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 border-b border-gray-200">
                    <div className="grid grid-cols-2">
                      <button
                        type="button"
                        onClick={() => setActiveTab("meta")}
                        className={`py-3 text-xs font-medium transition-colors ${
                          activeTab === "meta"
                            ? "text-gray-900"
                            : "text-gray-400"
                        }`}
                      >
                        Meta Audience
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab("tiktok")}
                        className={`py-3 text-xs font-medium transition-colors ${
                          activeTab === "tiktok"
                            ? "text-gray-900"
                            : "text-gray-400"
                        }`}
                      >
                        TikTok Audience
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2">
                  <div
                    className={`h-0.5 ${
                      activeTab === "meta" ? "bg-khaki-200" : "bg-transparent"
                    }`}
                  />
                  <div
                    className={`h-0.5 ${
                      activeTab === "tiktok" ? "bg-khaki-200" : "bg-transparent"
                    }`}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end mb-4">
                <button
                  type="button"
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  Clear filters
                </button>
              </div>

              {/* Content Card */}
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Country */}
                  {audience.country && audience.country.length > 0 && (
                    <div className="bg-white rounded-2xl p-4 border border-gray-200">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-3.5 bg-green-600 rounded-sm" />
                            <div className="text-xs font-semibold text-gray-900">
                              Country
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {audience.country.join(", ")}
                          </div>
                        </div>

                        <button
                          type="button"
                          className="text-[11px] text-peru-200 hover:underline"
                        >
                          Change country
                        </button>
                      </div>

                      {audience.locations && audience.locations.length > 0 && (
                        <div className="mt-3">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="text"
                              placeholder="Search for city or state"
                              className="w-full pl-9 pr-4 py-2 bg-slate-100 rounded-full focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-xs"
                            />
                          </div>

                          <div className="flex flex-wrap gap-2 mt-3">
                            {audience.locations.map((location, idx) => (
                              <TagPill
                                key={`${location}-${idx}`}
                                label={location}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Age */}
                  {(audience.metaConfig || audience.tiktokConfig) && (
                    <div className="bg-white rounded-2xl p-4 border border-gray-200">
                      <div className="text-xs font-semibold text-gray-900">
                        Age
                      </div>
                      <div className="text-[11px] text-gray-400 mt-1">
                        Set the audience age
                      </div>

                      {activeTab === "meta" && audience.metaConfig ? (
                        <div className="mt-4 grid grid-cols-2 gap-3">
                          <div>
                            <div className="text-[11px] text-gray-500 mb-2">
                              Min Age
                            </div>
                            <input
                              type="text"
                              defaultValue={audience.metaConfig.ageMin || ""}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                              readOnly
                            />
                          </div>
                          <div>
                            <div className="text-[11px] text-gray-500 mb-2">
                              Max Age
                            </div>
                            <input
                              type="text"
                              defaultValue={audience.metaConfig.ageMax || ""}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                              readOnly
                            />
                          </div>
                        </div>
                      ) : (
                        activeTab === "tiktok" &&
                        audience.tiktokConfig?.ageRanges && (
                          <div className="mt-4 space-y-3">
                            {audience.tiktokConfig.ageRanges.map((range) => (
                              <label
                                key={range}
                                className="flex items-center gap-3 text-xs text-gray-700"
                              >
                                <input
                                  type="checkbox"
                                  className="h-4 w-4 rounded border-gray-300"
                                  readOnly
                                />
                                <span>{range}</span>
                              </label>
                            ))}
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>

                {/* Core Interest Categories */}
                {audience.interests && audience.interests.length > 0 && (
                  <div className="mt-4 bg-white rounded-2xl p-4 border border-gray-200">
                    <div className="text-xs font-semibold text-gray-900">
                      Core Interest Categories
                    </div>
                    <div className="text-[11px] text-gray-400 mt-1">
                      Broad and sub-interests inferred from user activity and
                      profile data.
                    </div>

                    <div className="mt-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search for interest categories"
                          className="w-full pl-9 pr-4 py-2 bg-slate-100 rounded-full focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-xs"
                        />
                      </div>

                      <div className="flex flex-wrap gap-2 mt-3">
                        {audience.interests.map((interest, idx) => (
                          <TagPill
                            key={`${interest}-${idx}`}
                            label={interest}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-5">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 bg-khaki-200 text-gray-900 rounded-lg text-xs font-medium hover:bg-khaki-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? "Saving..." : "Save audience"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PanelLayout>
  );
}
