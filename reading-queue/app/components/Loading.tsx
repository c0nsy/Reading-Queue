export function Loading({ loading }: { loading: boolean }) {
  if (!loading) return null;
  return (
    <div className="flex justify-center py-10" role="status" aria-label="Loading">
      <div className="h-7 w-7 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600 dark:border-zinc-700 dark:border-t-zinc-200" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}
