import { Dispatch } from "react";
import {
  ActionSort,
  ActionSearch,
  ActionStatusFilter,
  ActionTags,
} from "./Action";
import { ArticleStatus } from "./Article";
import { Tag } from "./Tag";

export interface ToolbarState {
  search: string;
  sort: ActionSort["sortBy"];
  status: ArticleStatus | "all";
  tags: Tag[];
}

export type ToolbarDispatch = Dispatch<ToolbarAction>;

export type ToolbarAction =
  | ActionSort
  | ActionSearch
  | ActionStatusFilter
  | ActionTags;
