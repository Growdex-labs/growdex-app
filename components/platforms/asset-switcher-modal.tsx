interface MetaAsset {
  adAccountId: string;
  adAccountName: string;
  isPrimary: boolean;
}

export function MetaAssetSwitcherModal({
  assets,
  onSelect,
  onClose
}: {
  assets: MetaAsset[];
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
    const metaAssets = assets ?? [];
    const primaryAsset = metaAssets.find(a => a.isPrimary);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">
          Choose ad account
        </h2>

        <div className="space-y-2">
          {assets.map(asset => (
            <button
              key={asset.adAccountId}
              onClick={() => onSelect(asset.adAccountId)}
              className="w-full p-3 border rounded-lg text-left hover:bg-gray-50"
            >
              <div className="font-medium">
                {asset.adAccountName}
              </div>
              {asset.isPrimary && (
                <span className="text-xs text-green-600">
                  Current
                </span>
              )}
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          className="mt-4 text-sm text-gray-500"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
