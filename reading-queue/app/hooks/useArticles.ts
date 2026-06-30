import { useState, useEffect } from "react";
import { Article } from "../types/Article";
export function useFetchArticles(url: string) {
  const [articles, setArticles] = useState<Article[]>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error();
        const result = await response.json();
        setArticles(result);
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [url]);

  return { articles, isLoading, error };
}
