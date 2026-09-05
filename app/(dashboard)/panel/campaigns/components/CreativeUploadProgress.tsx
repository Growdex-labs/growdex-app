export type CreativeUploadStatus = { name: string; percent: number };

export function CreativeUploadProgress({ status }: { status?: CreativeUploadStatus | null }) {
  if (!status) return null;
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
      <div className="mb-2 flex items-center justify-between gap-3 text-sm text-gray-700">
        <span className="truncate">{status.name}</span>
        <span className="shrink-0 tabular-nums">{status.percent}%</span>
      </div>
      <progress className="h-2 w-full accent-violet-600" value={status.percent} max={100} aria-label={`Uploading ${status.name}`} />
      <p role="status" className="mt-1 text-xs text-gray-500">
        {status.percent === 100 ? "Upload transferred. Processing media…" : "Uploading media…"}
      </p>
    </div>
  );
}
