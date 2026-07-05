import { memo } from "react";
import { ArticleStatus } from "../types/Article";

type ArticleCardProps = {
  url: string;
  title: string;
  status: ArticleStatus;
};

const statusStyles: Record<ArticleStatus, string> = {
  unread: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  reading: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  archived: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
};

function ArticleCard({ url, title, status }: ArticleCardProps) {
  return (
    <article className="flex items-start gap-3 rounded-lg border border-zinc-200 bg-white p-4 transition-colors hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700">
      <svg
        aria-hidden="true"
        viewBox="0 0 16 16"
        className="mt-0.5 h-4 w-4 shrink-0 text-zinc-300 dark:text-zinc-600"
        fill="currentColor"
      >
        <circle cx="5" cy="4" r="1.4" />
        <circle cx="11" cy="4" r="1.4" />
        <circle cx="5" cy="8" r="1.4" />
        <circle cx="11" cy="8" r="1.4" />
        <circle cx="5" cy="12" r="1.4" />
        <circle cx="11" cy="12" r="1.4" />
      </svg>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-medium leading-snug text-zinc-900 dark:text-zinc-100">
            {title}
          </h2>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusStyles[status]}`}
          >
            {status}
          </span>
        </div>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          draggable={false}
          className="mt-1 block truncate text-sm text-zinc-500 hover:text-zinc-700 hover:underline dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          {url}
        </a>
      </div>
    </article>
  );
}

export default memo(ArticleCard);
