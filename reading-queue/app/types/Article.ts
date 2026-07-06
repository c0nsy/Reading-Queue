import { Dispatch } from "react";

import { Tag } from "./Tag";
import { Order } from "./Order";

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

export type ArticleStatus = "unread" | "read" | "archived";

export interface ArticleState {
  order: Order;
  status: Record<string, ArticleStatus>;
}

export interface ArticleOrder {
  type: "order";
  sourceId: string;
  targetId: string;
}

export interface ArticleUpdateStatus {
  type: "status";
  id: string;
  status: ArticleStatus;
}

export interface ArticleContextValue extends ArticleState, UseArticlesReturn {}

export type ArticleAction = ArticleOrder | ArticleSeed | ArticleUpdateStatus;

export type ArticleDispatch = Dispatch<ArticleAction>;

export interface ArticleSeed {
  type: "seed";
  order: Order;
}
