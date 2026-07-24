"use client";

import { useEffect, useRef, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  applyCampaignOptimizations,
  fetchCampaignOptimizations,
  requestCampaignOptimizations,
  type CampaignDto,
  type CampaignOptimizationProposal,
} from "@/lib/campaigns";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  SendHorizontal,
  Sparkles,
  TrendingUp,
} from "lucide-react";

interface OptimizationSidebarProps {
  campaignId: string;
  isOpen: boolean;
  onClose: () => void;
  onApplied?: (campaign: CampaignDto) => void;
}

export function OptimizationSidebar({
  campaignId,
  isOpen,
  onClose,
  onApplied,
}: OptimizationSidebarProps) {
  const [proposals, setProposals] = useState<CampaignOptimizationProposal[]>([]);
  const [revision, setRevision] = useState(0);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const requestRef = useRef<AbortController | null>(null);

  const storeResponse = (response: {
    revision: number;
    proposals: CampaignOptimizationProposal[];
  }) => {
    setRevision(response.revision);
    setProposals(response.proposals);
    setSelected(
      Object.fromEntries(response.proposals.map((proposal) => [proposal.id, true])),
    );
  };

  useEffect(() => {
    if (!isOpen) return;
    const controller = new AbortController();
    requestRef.current = controller;
    setLoading(true);
    setError(null);
    setSuccess(null);
    void fetchCampaignOptimizations(campaignId, controller.signal)
      .then(storeResponse)
      .catch((failure) => {
        if (!controller.signal.aborted) {
          setError(
            failure instanceof Error
              ? failure.message
              : "Could not load campaign optimizations.",
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [campaignId, isOpen]);

  const requestNewOptimizations = async () => {
    const instruction = prompt.trim();
    if (!instruction || loading || applying) return;
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await requestCampaignOptimizations(
        campaignId,
        instruction,
        controller.signal,
      );
      if (controller.signal.aborted) return;
      storeResponse(response);
      setPrompt("");
    } catch (failure) {
      if (!controller.signal.aborted) {
        setError(
          failure instanceof Error
            ? failure.message
            : "Could not generate campaign optimizations.",
        );
      }
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  };

  const selectedIds = proposals
    .filter((proposal) => selected[proposal.id])
    .map((proposal) => proposal.id);

  const applySelected = async () => {
    if (!selectedIds.length || applying || loading) return;
    setApplying(true);
    setError(null);
    setSuccess(null);
    try {
      const updated = await applyCampaignOptimizations({
        campaignId,
        revision,
        proposalIds: selectedIds,
        idempotencyKey: crypto.randomUUID(),
      });
      onApplied?.(updated);
      setProposals((current) =>
        current.filter((proposal) => !selectedIds.includes(proposal.id)),
      );
      setSelected({});
      setSuccess(
        `${selectedIds.length} approved change${selectedIds.length === 1 ? " was" : "s were"} applied.`,
      );
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : "Could not apply the selected optimizations.",
      );
    } finally {
      setApplying(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="flex w-full flex-col border-none bg-linear-to-br from-[#332C00] to-[#786800] text-white sm:max-w-[440px]">
        <SheetHeader className="space-y-4 pt-4">
          <Sparkles className="h-5 w-5 text-khaki-200" />
          <SheetTitle className="text-xl text-white">Optimize your campaign</SheetTitle>
          <p className="text-sm leading-6 text-white/70">
            Every recommendation is based on this campaign&apos;s measured performance. Review the evidence and risk before applying it.
          </p>
          {!loading && proposals.length > 0 && (
            <div className="flex items-center gap-3 rounded-lg bg-khaki-200/80 p-3 text-gray-900">
              <TrendingUp className="h-5 w-5" />
              <p className="text-sm font-semibold">
                {proposals.length} optimization opportunit{proposals.length === 1 ? "y" : "ies"}
              </p>
            </div>
          )}
        </SheetHeader>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-6 hide-scrollbar">
          {loading && (
            <div className="flex items-center gap-3 rounded-xl bg-black/20 p-4 text-sm text-white/80">
              <Loader2 className="h-4 w-4 animate-spin" /> Analyzing live campaign evidence…
            </div>
          )}
          {error && (
            <div className="flex items-start gap-2 rounded-xl bg-red-950/40 p-4 text-sm text-red-100">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
            </div>
          )}
          {success && (
            <div className="flex items-start gap-2 rounded-xl bg-emerald-950/40 p-4 text-sm text-emerald-100">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> {success}
            </div>
          )}
          {!loading && !error && proposals.length === 0 && !success && (
            <p className="rounded-xl bg-black/20 p-4 text-sm text-white/70">
              No evidence-backed changes are available for this campaign yet.
            </p>
          )}
          {proposals.map((proposal) => (
            <article key={proposal.id} className="rounded-xl bg-black/20 p-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  aria-label={`Select ${proposal.title}`}
                  checked={Boolean(selected[proposal.id])}
                  onCheckedChange={(checked) =>
                    setSelected((current) => ({
                      ...current,
                      [proposal.id]: checked === true,
                    }))
                  }
                  disabled={loading || applying}
                  className="mt-1 border-khaki-200 data-[state=checked]:border-khaki-200 data-[state=checked]:bg-khaki-200 data-[state=checked]:text-gray-900"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold">{proposal.title}</h3>
                  <p className="mt-1 text-xs leading-5 text-white/65">{proposal.summary}</p>
                  <dl className="mt-3 space-y-2 rounded-lg bg-black/20 p-3 text-xs">
                    <div>
                      <dt className="font-medium text-khaki-200">Evidence · {proposal.evidence.window}</dt>
                      <dd className="mt-0.5 text-white/70">
                        {proposal.evidence.metric}: {proposal.evidence.observation}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-emerald-200">Expected outcome</dt>
                      <dd className="mt-0.5 text-white/70">{proposal.expectedOutcome}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-amber-200">Risk</dt>
                      <dd className="mt-0.5 text-white/70">{proposal.risk}</dd>
                    </div>
                  </dl>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {proposal.affectedFields.map((field) => (
                      <span key={field} className="rounded-full bg-white/10 px-2 py-1 text-[10px] text-white/70">
                        {field}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="space-y-3 border-t border-white/15 p-4">
          <button
            type="button"
            onClick={() => void applySelected()}
            disabled={!selectedIds.length || loading || applying}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-khaki-200 py-3 font-semibold text-gray-900 transition-colors hover:bg-khaki-300 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {applying && <Loader2 className="h-4 w-4 animate-spin" />}
            Apply {selectedIds.length || "selected"} change{selectedIds.length === 1 ? "" : "s"}
          </button>
          <div className="relative">
            <input
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void requestNewOptimizations();
                }
              }}
              disabled={loading || applying}
              placeholder="What would you like to improve?"
              className="w-full rounded-lg border border-white/40 bg-transparent px-4 py-3 pr-12 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-khaki-200 disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => void requestNewOptimizations()}
              disabled={!prompt.trim() || loading || applying}
              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg bg-white text-black disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Ask Growdex AI to optimize"
            >
              <SendHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
