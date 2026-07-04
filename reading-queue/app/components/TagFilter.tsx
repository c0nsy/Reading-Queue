import { createContext, ReactNode, useContext } from "react";
import { Tag, TagFilterValue } from "../types/Tag";
import {
  ToolbarDispatchContext,
  ToolbarStateContext,
} from "./providers/ToolbarProvider";

const TagFilterContext = createContext<TagFilterValue | null>(null);

export function TagFilter({ children }: { children: ReactNode }) {
  const state = useContext(ToolbarStateContext);
  const dispatch = useContext(ToolbarDispatchContext);

  function toggle(tag: Tag): void {
    dispatch({ type: "tags", tag: tag });
  }

  return (
    <TagFilterContext.Provider
      value={{ selectedTags: state.tags, toggle: toggle }}
    >
      {children}
    </TagFilterContext.Provider>
  );
}

function Option({ children, tag }: { children: ReactNode; tag: Tag }) {
  const tagFilter = useContext(TagFilterContext);
  if (tagFilter === null)
    throw new Error("TagFilter.Option must be used inside <TagFilter>");
  const { selectedTags, toggle } = tagFilter;

  const isSelected = selectedTags.includes(tag);

  const base =
    "select-none rounded-full border px-3 py-1 text-sm font-medium transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-500";
  const selected =
    "border-zinc-900 bg-zinc-900 text-white hover:bg-zinc-800 dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white";
  const unselected =
    "border-zinc-300 bg-white text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800";

  return (
    <button
      type="button"
      onClick={() => toggle(tag)}
      aria-pressed={isSelected}
      className={`${base} ${isSelected ? selected : unselected}`}
    >
      {children}
    </button>
  );
}

TagFilter.Option = Option;
