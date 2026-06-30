import { useState, useEffect } from "react";
import { Article, UseArticlesReturn } from "../types/Article";
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
