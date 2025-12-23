import { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  message: string;
  description?: string;
  actionButton?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
  };
}

export function EmptyState({
  icon,
  message,
  description,
  actionButton,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 md:py-16">
      {/* Icon/Illustration */}
      {icon && <div className="mb-4 md:mb-6">{icon}</div>}

      {/* Message */}
      <p className="text-sm md:text-base text-gray-500 text-center max-w-md mb-2">
        {message}
      </p>

      {/* Optional Description */}
      {description && (
        <p className="text-xs md:text-sm text-gray-400 text-center max-w-md mb-6">
          {description}
        </p>
      )}

      {/* Optional Action Button */}
      {actionButton && (
        <button
          onClick={actionButton.onClick}
          className="flex items-center gap-2 bg-khaki-200 text-gray-900 px-6 py-2.5 rounded-lg font-medium hover:bg-khaki-300 transition-colors"
        >
          {actionButton.icon}
          {actionButton.label}
        </button>
      )}
    </div>
  );
}
