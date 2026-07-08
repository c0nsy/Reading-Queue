import { assertUnreachable } from "../utils/unreachable";
import { ArticleState, ArticleAction } from "../types/Article";
export function articleReducer(
  state: ArticleState,
  action: ArticleAction,
): ArticleState {
  switch (action.type) {
    case "order":
      const { sourceId, targetId } = action;
      const order = [...state.order];

      const sourceIndex = order.indexOf(sourceId);
      const targetIndex = order.indexOf(targetId);

      const nextOrder = [...order];

      nextOrder.splice(sourceIndex, 1);

      nextOrder.splice(targetIndex, 0, sourceId);

      return { ...state, order: nextOrder };

    case "seed":
      return { ...state, order: action.order };
    case "status":
      return {
        ...state,
        status: { ...state.status, [action.id]: action.status },
      };
    default:
      assertUnreachable(action);
  }
}
