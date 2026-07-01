import { Dispatch, SetStateAction } from "react";
import { ActionSort, ActionTags, ArticleAction } from "./Action";
import { ArticleStatus } from "./Article";

export interface ToolbarState {
  search: string;
  sort: ActionSort["sortBy"];
  status: ArticleStatus | "all";
  tags: ActionTags["tags"];
}

export type ToolbarDispatch = Dispatch<ArticleAction>;
