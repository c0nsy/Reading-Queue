import { getArticleContent } from "../services/fetchArticleContent";
import { use } from "react";

export default function ReaderView({
  id,
  onClose,
}: {
  id: string;
  onClose?: () => void;
}) {
  const content = use(getArticleContent(id));

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="animate-reader-backdrop absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="animate-reader-panel relative flex h-full w-full max-w-2xl flex-col overflow-y-auto border-l border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
        <button
          onClick={onClose}
          aria-label="Close reader"
          className="absolute right-4 top-4 rounded-full p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18 18 6M6 6l12 12"
            />
          </svg>
        </button>

        <article className="px-8 py-16 sm:px-12">
          <header className="mb-10 border-b border-zinc-200 pb-6 dark:border-zinc-800">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
              Reader
            </p>
            <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-tight text-zinc-900 dark:text-zinc-50">
              Article {id}
            </h1>
          </header>

          <div className="space-y-6 text-lg leading-8 text-zinc-700 dark:text-zinc-300">
            <p>{content}</p>
          </div>
        </article>
      </div>
    </div>
  );
}
