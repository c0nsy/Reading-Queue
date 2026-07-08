type ArticleFormProps = {
  isPending: boolean;
  formAction: (payload: FormData) => void;
};
export function ArticleForm({ isPending, formAction }: ArticleFormProps) {
  return (
    <form action={formAction} className="flex gap-2">
      <input
        type="url"
        name="url"
        placeholder="Paste a URL…"
        disabled={isPending}
        className="min-w-0 flex-1 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-600 dark:focus:ring-white/10"
      />
      <button
        type="submit"
        disabled={isPending}
        className="shrink-0 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {isPending ? "..." : "Add"}
      </button>
    </form>
  );
}
