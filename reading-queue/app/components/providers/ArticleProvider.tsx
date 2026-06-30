"use client";

import { ReactNode, createContext } from "react";
import { UseArticlesReturn } from "@/app/types/Article";
import { useFetchArticles } from "@/app/hooks/useArticles";

export const ArticleContext = createContext<UseArticlesReturn>({
  articles: [],
  isLoading: false,
  error: null,
});
export function ArticleProvider({ children }: { children: ReactNode }) {
  const { articles, isLoading, error } = useFetchArticles();
  return (
    <>
      <ArticleContext value={{ articles, isLoading, error }}>
        {children}
      </ArticleContext>
    </>
  );
}
