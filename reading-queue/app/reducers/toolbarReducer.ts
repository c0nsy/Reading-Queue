import { ArticleAction } from "../types/Action";
import { ToolbarState } from "../types/Toolbar";

function assertUnreachable(x: never): never {
  throw new Error(`Unexpected object: ${x}`);
}
export function toolbarReducer(
  state: ToolbarState,
  action: ArticleAction,
): ToolbarState {
  switch (action.type) {
    case "search":
      return { ...state, search: action.query };
    case "sort":
      return { ...state, sort: action.sortBy };
    case "status":
      return { ...state, status: action.status };
    case "tags":
      return { ...state, tags: action.tags };
    default:
      assertUnreachable(action);
  }
}
