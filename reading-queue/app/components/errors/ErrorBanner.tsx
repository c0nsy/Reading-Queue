import React from "react";

interface ErrorBannerProps {
  message: string;
  title?: string;
  onDismiss?: () => void;
  actionText?: string;
  onActionClick?: () => void;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({
  message,
  title = "An error occurred",
  onDismiss,
  actionText,
  onActionClick,
}) => {
  return (
    <div
      className="flex flex-col sm:flex-row items-start justify-between gap-4 p-4 my-4 bg-red-50 border-l-4 border-red-600 rounded-r-md shadow-sm"
      role="alert"
    >
      <div className="flex items-start gap-3">
        {/* Error SVG Icon */}
        <svg
          className="w-5 h-5 text-red-600 shrink-0 mt-0.5"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>

        {/* Content */}
        <div>
          <h3 className="font-semibold text-red-800 text-sm leading-5">
            {title}
          </h3>
          <p className="mt-1 text-sm text-red-700 leading-relaxed">{message}</p>
        </div>
      </div>

      {/* Actions (Action Button & Close Button) */}
      <div className="flex items-center gap-3 ml-auto sm:ml-0 shrink-0">
        {actionText && onActionClick && (
          <button
            onClick={onActionClick}
            className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded transition-colors duration-150"
          >
            {actionText}
          </button>
        )}

        {onDismiss && (
          <button
            onClick={onDismiss}
            aria-label="Dismiss banner"
            className="p-1 text-red-500 hover:text-red-800 rounded hover:bg-red-100 transition-colors duration-150"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};
