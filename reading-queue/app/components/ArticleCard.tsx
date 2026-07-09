import { memo, startTransition, useOptimistic } from "react";
import { ArticleStatus } from "../types/Article";
import { updateArticleStatus } from "../services/updateArticleStatus";
import { useContext } from "react";
import { ArticleDispatchContext } from "./providers/ArticleProvider";
type ArticleCardProps = {
  url: string;
  title: string;
  status: ArticleStatus;
  id: string;
  onError: (message: string) => void;
  openReaderView: (id: string) => void;
};

const statusStyles: Record<ArticleStatus, string> = {
  unread: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  read: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  archived: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
};

function ArticleCard({
  url,
  title,
  status,
  id,
  onError,
  openReaderView,
}: ArticleCardProps) {
  const [optimisticStatus, setOptimisticStatus] = useOptimistic(
    status,
    (currentStatus, newStatus: ArticleStatus) => newStatus,
  );
  const dispatch = useContext(ArticleDispatchContext);

  function handleUpdateStatus(id: string, status: ArticleStatus) {
    const next = "read";
    startTransition(async () => {
      setOptimisticStatus(next);
      try {
        await updateArticleStatus(id, next);
        dispatch({ type: "status", id, status: next });
      } catch (err) {
        onError("Couldn't update status");
        console.error(err);
      }
    });
  }
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
          <button
            className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusStyles[optimisticStatus]}`}
            onClick={() => handleUpdateStatus(id, status)}
          >
            {optimisticStatus}
          </button>
        </div>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          draggable={false}
          className="mt-1 block break-all text-sm text-zinc-500 hover:text-zinc-700 hover:underline dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          {url}
        </a>
        <button
          onClick={() => {
            openReaderView(id);
          }}
          className="mt-3 inline-flex items-center gap-1 rounded-md bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-200 hover:text-zinc-900 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 dark:hover:text-zinc-100"
        >
          Read
          <svg
            className="h-3 w-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </article>
  );
}

export default memo(ArticleCard);
