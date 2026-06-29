import { ActionSort, ActionTags } from "./Action";
import { ArticleStatus } from "./Article";

export interface ToolbarState {
  search: string;
  sort: ActionSort["sortBy"];
  status: ArticleStatus | "all";
  tags: ActionTags["tags"];
}
