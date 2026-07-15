"use client";

import { GradientSparkle } from "./GradientSparkle";

interface AdCreatedModalProps {
  open: boolean;
  onClose: () => void;
  onSetupCreative?: () => void;
}

export function AdCreatedModal({
  open,
  onClose,
  onSetupCreative,
}: AdCreatedModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <GradientSparkle className="mx-auto mb-4 h-10 w-10" />
        <h2 className="text-lg font-bold text-gray-900">
          Your ad has been created!
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          Add your creative from the asset library and run your ad
        </p>
        <button
          type="button"
          onClick={onSetupCreative}
          className="mt-5 rounded-lg bg-khaki-200 px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-khaki-300 transition-colors"
        >
          Setup creative
        </button>
      </div>
    </div>
  );
}

export default AdCreatedModal;
