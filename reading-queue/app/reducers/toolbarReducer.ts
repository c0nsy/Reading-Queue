import { ArticleAction } from "../types/Action";
import { ToolbarState } from "../types/Toolbar";
// we are going to pass the useReducer function an object that has all of our filters
// searching by text, sort order, status filter, set of selected tags
// usage
// const [state, dispatch] = useReducer(toolbarReducer, {text, sort order ,status filter, tags})
// state is our objects
// dispatch is what we are calling to update our state

// we are passing the action into the dispatch functiuon
// we have our Article actions

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
