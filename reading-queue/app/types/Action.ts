import { ArticleStatus } from "./Article";
export interface ActionSort {
  sortBy: "date" | "title" | "status";
  type: "sort";
}

export interface ActionSearch {
  query: string;
  type: "search";
}

export interface ActionStatusFilter {
  status: ArticleStatus | "all";
  type: "status";
}

export interface ActionTags {
  tags: string[];
  type: "tags";
}

export type ArticleAction =
  | ActionSort
  | ActionSearch
  | ActionStatusFilter
  | ActionTags;
