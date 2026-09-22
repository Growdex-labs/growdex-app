"use client";

import { useEffect, useRef, useState } from "react";
import { fetchTikTokIdentities, type CampaignCreativeInput, type TikTokIdentity } from "@/lib/campaigns";
import { uploadCreativeToCloudinary } from "@/lib/media-upload";

export function TikTokCreativeControls({ assetId, creative, onChange }: {
  assetId?: string;
  creative: CampaignCreativeInput;
  onChange: (next: Partial<CampaignCreativeInput>) => void;
}) {
  const [identities, setIdentities] = useState<TikTokIdentity[]>([]);
  const [loading, setLoading] = useState(Boolean(assetId));
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  // Async completions (identity fetch, cover upload) must merge over the
  // latest creative, not the one captured when the request started — an
  // identity auto-selected mid-upload would otherwise be wiped.
  const creativeRef = useRef(creative);
  creativeRef.current = creative;
  useEffect(() => {
    let active = true;
    if (!assetId) return;
    void fetchTikTokIdentities(assetId).then((result) => { if (active) setIdentities(result); })
      .catch((failure) => { if (active) setError(failure instanceof Error ? failure.message : "Could not load TikTok identities."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [assetId]);
  return <div className="space-y-4 rounded-xl border border-gray-200 p-4">
    <label className="block text-sm font-gilroy-medium text-gray-700">TikTok identity
      <select className="mt-2 h-11 w-full rounded-lg border bg-white px-3" disabled={loading || !assetId} value={creative.tiktok ? `${creative.tiktok.identityType}:${creative.tiktok.identityId}` : ""} onChange={(event) => {
        const identity = identities.find((item) => `${item.type}:${item.id}` === event.target.value);
        const tiktok = creativeRef.current.tiktok;
        if (identity) onChange({ tiktok: { ...tiktok, identityType: identity.type, identityId: identity.id, identityAuthorizedBcId: identity.authorizedBcId, postId: tiktok?.identityId === identity.id ? tiktok.postId : undefined } });
      }}>
        <option value="">{loading ? "Loading identities…" : "Choose a linked TikTok identity"}</option>
        {identities.map((identity) => <option key={`${identity.type}:${identity.id}`} value={`${identity.type}:${identity.id}`}>{identity.name}</option>)}
      </select>
    </label>
    {!loading && !identities.length && !error && <p className="text-xs text-amber-700">Link a TikTok account to this advertiser in TikTok Business Center, then reopen this step.</p>}
    {!creative.tiktok?.postId && <label className="block text-sm font-gilroy-medium text-gray-700">Video cover
      <input type="file" accept="image/jpeg,image/png" disabled={uploading} className="mt-2 block w-full text-sm" onChange={(event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        setUploading(true); setError(null);
        void uploadCreativeToCloudinary(file).then((result) => {
          const tiktok = creativeRef.current.tiktok;
          onChange(tiktok
            ? { thumbnailUrl: result.url, tiktok: { ...tiktok, coverImageId: undefined } }
            : { thumbnailUrl: result.url });
        })
          .catch((failure) => setError(failure instanceof Error ? failure.message : "Could not upload the cover."))
          .finally(() => setUploading(false));
      }} />
      <span className="mt-1 block text-xs text-gray-500">Use a JPG or PNG with the same aspect ratio as your video. {uploading ? "Uploading…" : creative.thumbnailUrl || creative.tiktok?.coverImageId ? "A cover is selected." : "Select a cover before publishing."}</span>
    </label>}
    {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
  </div>;
}
