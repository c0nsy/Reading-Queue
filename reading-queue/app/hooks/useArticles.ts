import { useState, useEffect, useContext, useDeferredValue } from "react";
import { Article, UseArticlesReturn } from "../types/Article";
import { ArticleContext } from "../components/providers/ArticleProvider";
import { ToolbarStateContext } from "../components/providers/ToolbarProvider";

export function useArticles(): UseArticlesReturn {
  const { articles, isLoading, error } = useContext(ArticleContext);
  const toolbarState = useContext(ToolbarStateContext);

  const deferredSearch = useDeferredValue(toolbarState.search);

  const filteredArticles = articles
    .filter(
      (article) =>
        toolbarState.status === "all" || article.status === toolbarState.status,
    )
    .filter(
      (article) =>
        deferredSearch === "" ||
        article.title.toLowerCase().includes(deferredSearch.toLowerCase()),
    )
    .sort((a, b) => {
      switch (toolbarState.sort) {
        case "title":
          return a.title.localeCompare(b.title);
        case "status":
          return a.status.localeCompare(b.status);
        // we do nothing for date

        default:
          return 0;
      }
    });

  return { articles: filteredArticles, isLoading, error };
}

export function useFetchArticles(): UseArticlesReturn {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/articles");
        if (!response.ok) {
          throw new Error(
            `HTTP Error, Status: ${response.status} ${response.statusText}`,
          );
        }
        const result = await response.json();
        setArticles(result);
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return { articles, isLoading, error };
}
