"use client";
import { useReducer } from "react";
import { toolbarReducer } from "../reducers/toolbarReducer";
export function Toolbar() {
  // our object has to have, search string, sort order, status filter, selected tags
  const [state, dispatch] = useReducer(toolbarReducer, {
    search: "",
    sort: "date",
    status: "all",
    tags: [],
  });
  function handleSearch() {
    dispatch({ type: "search", query: "react" });
  }
  function handleSort() {
    dispatch({ type: "sort", sortBy: "status" });
  }
  function handleStatus() {
    dispatch({ type: "status", status: "unread" });
  }
  function handleTags() {
    dispatch({ type: "tags", tags: ["tech", "finance"] });
  }
  const btn =
    "rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 dark:hover:text-white";

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900/50">
        <button onClick={handleSearch} className={btn}>
          search
        </button>
        <button onClick={handleSort} className={btn}>
          sort
        </button>
        <button onClick={handleStatus} className={btn}>
          status
        </button>
        <button onClick={handleTags} className={btn}>
          tags
        </button>
      </div>

      <pre className="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-950 p-4 font-mono text-sm leading-relaxed text-zinc-100">
        {JSON.stringify(state, null, 2)}
      </pre>
    </section>
  );
}
