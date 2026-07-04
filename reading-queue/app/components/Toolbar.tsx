"use client";
import { useContext } from "react";
import {
  ToolbarDispatchContext,
  ToolbarStateContext,
} from "./providers/ToolbarProvider";
import { Tag } from "../types/Tag";
import { TagFilter } from "./TagFilter";
export function Toolbar() {
  const dispatch = useContext(ToolbarDispatchContext);
  const state = useContext(ToolbarStateContext);
  function handleSearch(query: string) {
    dispatch({ type: "search", query: query });
  }
  function handleSort() {
    dispatch({ type: "sort", sortBy: "status" });
  }
  function handleStatus() {
    dispatch({ type: "status", status: "reading" });
  }
  const btn =
    "rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 dark:hover:text-white";
  const searchInput =
    "min-w-[12rem] flex-1 rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-700 placeholder:text-zinc-400 transition-colors focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:placeholder:text-zinc-500 dark:focus:border-zinc-600 dark:focus:ring-zinc-700";

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900/50">
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={state.search}
            onChange={(e) => {
              handleSearch(e.target.value);
            }}
            placeholder="Search articles"
            className={searchInput}
          />
          <button onClick={handleStatus} className={btn}>
            status
          </button>
          <button onClick={handleSort} className={btn}>
            sort
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-zinc-200 pt-3 dark:border-zinc-800">
          <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Tags
          </span>
          <TagFilter>
            <TagFilter.Option tag="tech">Tech</TagFilter.Option>
            <TagFilter.Option tag="entertainment">
              Entertainment
            </TagFilter.Option>
            <TagFilter.Option tag="sports">Sports</TagFilter.Option>
            <TagFilter.Option tag="esports">eSports</TagFilter.Option>
            <TagFilter.Option tag="finance">Finance</TagFilter.Option>
          </TagFilter>
          {state.tags.length > 0 && (
            <span className="ml-auto text-xs text-zinc-500 dark:text-zinc-400">
              {state.tags.length} selected
            </span>
          )}
        </div>
      </div>

      <pre className="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-950 p-4 font-mono text-sm leading-relaxed text-zinc-100">
        {JSON.stringify(state, null, 2)}
      </pre>
    </section>
  );
}
