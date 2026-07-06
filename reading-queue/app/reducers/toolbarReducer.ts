import { ToolbarState, ToolbarAction } from "../types/Toolbar";
import { assertUnreachable } from "../utils/unreachable";

export function toolbarReducer(
  state: ToolbarState,
  action: ToolbarAction,
): ToolbarState {
  switch (action.type) {
    case "search":
      return { ...state, search: action.query };
    case "sort":
      return { ...state, sort: action.sortBy };
    case "status":
      return { ...state, status: action.status };
    case "tags": {
      const nextTags = state.tags.includes(action.tag)
        ? state.tags.filter((tag) => tag !== action.tag)
        : [...state.tags, action.tag];
      return { ...state, tags: nextTags };
    }
    default:
      assertUnreachable(action);
  }
}
