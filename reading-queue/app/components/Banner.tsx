import React from "react";

type BannerVariant = "success" | "error";

interface BannerProps {
  variant: BannerVariant;
  message: string;
  title?: string;
  onDismiss?: () => void;
  actionText?: string;
  onActionClick?: () => void;
}

const variantStyles: Record<
  BannerVariant,
  {
    container: string;
    accent: string;
    title: string;
    body: string;
    button: string;
    dismiss: string;
    role: "alert" | "status";
    defaultTitle: string;
    iconPath: string;
  }
> = {
  success: {
    container:
      "bg-green-50 border-green-600 dark:bg-green-950/40 dark:border-green-500",
    accent: "text-green-600 dark:text-green-400",
    title: "text-green-800 dark:text-green-300",
    body: "text-green-700 dark:text-green-400",
    button:
      "text-green-700 bg-green-100 hover:bg-green-200 dark:text-green-200 dark:bg-green-900 dark:hover:bg-green-800",
    dismiss:
      "text-green-500 hover:text-green-800 hover:bg-green-100 dark:text-green-400 dark:hover:text-green-200 dark:hover:bg-green-900",
    role: "status",
    defaultTitle: "Success",
    iconPath: "M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  },
  error: {
    container:
      "bg-red-50 border-red-600 dark:bg-red-950/40 dark:border-red-500",
    accent: "text-red-600 dark:text-red-400",
    title: "text-red-800 dark:text-red-300",
    body: "text-red-700 dark:text-red-400",
    button:
      "text-red-700 bg-red-100 hover:bg-red-200 dark:text-red-200 dark:bg-red-900 dark:hover:bg-red-800",
    dismiss:
      "text-red-500 hover:text-red-800 hover:bg-red-100 dark:text-red-400 dark:hover:text-red-200 dark:hover:bg-red-900",
    role: "alert",
    defaultTitle: "An error occurred",
    iconPath:
      "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
  },
};

export const Banner: React.FC<BannerProps> = ({
  variant,
  message,
  title,
  onDismiss,
  actionText,
  onActionClick,
}) => {
  const styles = variantStyles[variant];
  return (
    <div
      className={`flex flex-col sm:flex-row items-start justify-between gap-4 rounded-r-md border-l-4 p-4 my-4 shadow-sm ${styles.container}`}
      role={styles.role}
    >
      <div className="flex items-start gap-3">
        <svg
          className={`mt-0.5 h-5 w-5 shrink-0 ${styles.accent}`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d={styles.iconPath}
          />
        </svg>

        <div>
          <h3 className={`text-sm font-semibold leading-5 ${styles.title}`}>
            {title ?? styles.defaultTitle}
          </h3>
          <p className={`mt-1 text-sm leading-relaxed ${styles.body}`}>
            {message}
          </p>
        </div>
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-3 sm:ml-0">
        {actionText && onActionClick && (
          <button
            onClick={onActionClick}
            className={`rounded px-3 py-1.5 text-xs font-medium transition-colors duration-150 ${styles.button}`}
          >
            {actionText}
          </button>
        )}

        {onDismiss && (
          <button
            onClick={onDismiss}
            aria-label="Dismiss banner"
            className={`rounded p-1 transition-colors duration-150 ${styles.dismiss}`}
          >
            <svg
              className="h-4 w-4"
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
