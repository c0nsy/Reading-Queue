import { Tag } from "./Tag";

export interface Article {
  id: string;
  url: string;
  title: string;
  status: ArticleStatus;
  tags: Tag[];
}

export interface UseArticlesReturn {
  articles: Article[];
  isLoading: boolean;
  error: unknown;
}

export type ArticleStatus = "unread" | "reading" | "archived";
