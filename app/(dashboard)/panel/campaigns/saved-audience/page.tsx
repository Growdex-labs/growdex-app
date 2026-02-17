"use client";

import { useEffect, useState } from "react";
import { PanelLayout } from "../../components/panel-layout";
import { CampaignsSidebar } from "../../components/campaigns-sidebar";
import { CampaignsMobileHeader } from "../../components/campaigns-mobile-header";
import { Plus, Search, SlidersHorizontal, Trash2, PenLine } from "lucide-react";
import { useRouter } from "next/navigation";
import { fetchAudiences, deleteAudience, Audience } from "@/lib/audiences";
import { useMe } from "@/context/me-context";

export default function SavedAudiencePage() {
  const router = useRouter();
  const { me } = useMe();
  const [audiences, setAudiences] = useState<Audience[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  const userName =
    me?.profile?.firstName && me?.profile?.lastName
      ? `${me.profile.firstName} ${me.profile.lastName}`
      : (me?.email ?? "Account");

  useEffect(() => {
    const loadAudiences = async () => {
      try {
        setLoading(true);
        const data = await fetchAudiences();
        setAudiences(data);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch audiences",
        );
        setAudiences([]);
      } finally {
        setLoading(false);
      }
    };

    loadAudiences();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this audience?")) {
      return;
    }

    try {
      setDeleting(id);
      await deleteAudience(id);
      setAudiences(audiences.filter((a) => a.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete audience");
    } finally {
      setDeleting(null);
    }
  };

  const filteredAudiences = audiences.filter((audience) =>
    audience.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <PanelLayout>
      <div className="flex h-screen">
        {/* Secondary Sidebar - Hidden on mobile */}
        <div className="hidden md:block">
          <CampaignsSidebar />
        </div>

        {/* Main Content */}
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
                <span className="text-gray-900">Campaign test</span>
              </div>

              {/* Page Header */}
              <div className="flex items-center justify-between gap-4 mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Saved Audiences
                </h1>

                <div className="flex items-center gap-3">
                  <button className="px-5 py-2.5 bg-khaki-200 text-gray-900 rounded-lg font-medium flex items-center gap-2 hover:bg-khaki-300 transition-colors">
                    <Plus className="w-5 h-5" />
                    Create new audience
                  </button>
                  <button className="px-5 py-2.5 border border-gray-300 bg-white text-peru-200 rounded-lg font-medium flex items-center gap-2 hover:bg-gray-50 transition-colors">
                    <SlidersHorizontal className="w-5 h-5" />
                    Filter
                  </button>
                </div>
              </div>

              {/* Search */}
              <div className="mb-6">
                <div className="relative w-full max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-100 rounded-full focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  />
                </div>
              </div>

              {/* List */}
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-gray-500">Loading audiences...</div>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-red-500">{error}</div>
                </div>
              ) : filteredAudiences.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-gray-500">No audiences found</div>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredAudiences.map((audience) => (
                    <div
                      key={audience.id}
                      role="button"
                      tabIndex={0}
                      onClick={() =>
                        router.push(
                          `/panel/campaigns/saved-audience/${audience.id}`,
                        )
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          router.push(
                            `/panel/campaigns/saved-audience/${audience.id}`,
                          );
                        }
                      }}
                      className="flex items-center justify-between gap-4 bg-lavender-50/40 border border-gray-200 rounded-xl px-5 py-4"
                    >
                      <div className="font-medium text-gray-900">
                        {audience.name}
                      </div>

                      <div className="flex-1 flex items-center justify-center">
                        <div className="text-xs text-gray-500">
                          Created by:{" "}
                          <span className="text-gray-900">{userName}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <button
                          className="p-2 rounded-lg hover:bg-white transition-colors"
                          aria-label="Edit audience"
                          type="button"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <PenLine className="w-4 h-4 text-peru-200" />
                        </button>

                        <button
                          className="flex items-center gap-2 text-red-500 hover:text-red-600 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                          type="button"
                          onClick={(e) => handleDelete(audience.id, e)}
                          disabled={deleting === audience.id}
                        >
                          <Trash2 className="w-4 h-4" />
                          {deleting === audience.id
                            ? "Deleting..."
                            : "Delete audience"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PanelLayout>
  );
}
