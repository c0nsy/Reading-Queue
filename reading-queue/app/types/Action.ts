import { ArticleStatus } from "./Article";
interface ActionSort {
  sortBy: "date" | "title" | "status";
  type: "sort";
}

interface ActionSearch {
  query: string;
  type: "search";
}

interface ActionStatusFilter {
  status: ArticleStatus;
  type: "status";
}

interface ActionTags {
  tags: string[];
  type: "tags";
}

export type ArticleAction =
  | ActionSort
  | ActionSearch
  | ActionStatusFilter
  | ActionTags;
