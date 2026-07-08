"use client";

import { ReactNode, createContext, useEffect, useReducer } from "react";
import {
  ArticleDispatch,
  ArticleContextValue,
  UseArticlesReturn,
} from "@/app/types/Article";
import { useFetchArticles } from "@/app/hooks/useArticles";
import { articleReducer } from "@/app/reducers/articleReducer";

export const defaultArticleState = {
  articles: [],
  isLoading: false,
  error: null,
  order: [],
  status: {},
};

export const ArticleDispatchContext = createContext<ArticleDispatch>(() => {});
export const ArticleStateContext =
  createContext<ArticleContextValue>(defaultArticleState);

export function ArticleProvider({ children }: { children: ReactNode }) {
  const { articles, isLoading, error } = useFetchArticles();
  const [state, dispatch] = useReducer(articleReducer, defaultArticleState);

  useEffect(() => {
    if (articles.length > 0 && state.order.length === 0) {
      dispatch({ type: "seed", order: articles.map((article) => article.id) });
    }
  }, [articles]);
  return (
    <>
      <ArticleDispatchContext.Provider value={dispatch}>
        <ArticleStateContext.Provider
          value={{
            articles,
            isLoading,
            error,
            order: state.order,
            status: state.status,
          }}
        >
          {children}
        </ArticleStateContext.Provider>
      </ArticleDispatchContext.Provider>
    </>
  );
}
