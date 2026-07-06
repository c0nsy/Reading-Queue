import { ArticleStatus } from "./Article";
import { Tag } from "./Tag";
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
  tag: Tag;
  type: "tags";
}
