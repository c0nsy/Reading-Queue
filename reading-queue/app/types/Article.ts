export interface Article {
  id: string;
  url: string;
  title: string;
  status: ArticleStatus;
}

export type ArticleStatus = "unread" | "reading" | "archived";
