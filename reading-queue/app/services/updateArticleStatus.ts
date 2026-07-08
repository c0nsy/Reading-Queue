import { ArticleStatus } from "../types/Article";

export function updateArticleStatus(
  id: string,
  status: ArticleStatus,
): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    setTimeout(() => {
      const roll = Math.random();
      if (roll > 0.5) {
        resolve(`article ${id}: updated to ${status}`);
      } else {
        reject(`article ${id}: failed to update to ${status}`);
      }
    }, 2000);
  });
}
