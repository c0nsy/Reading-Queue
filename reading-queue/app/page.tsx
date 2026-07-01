"use client";

import { useArticles } from "./hooks/useArticles";

import { ThemeButton } from "./components/ThemeButton";
import { Toolbar } from "./components/Toolbar";
import { Loading } from "./components/Loading";
import { ArticleCard } from "./components/ArticleCard";
import { ErrorMessage } from "./components/ErrorMessage";

export default function Home() {
  const { articles, isLoading, error } = useArticles();
  return (
    <>
      <main className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-12">
        <header className="flex items-center justify-between border-b border-zinc-200 pb-4 dark:border-zinc-800">
          <h1 className="text-2xl font-semibold tracking-tight">
            Reading Queue
          </h1>
          {/* change the theme */}
          <ThemeButton />
        </header>
        <Toolbar />
        <Loading loading={isLoading} />
        <ErrorMessage error={error} />
        <div className="flex flex-col gap-3">
          {articles.map((article) => (
            <ArticleCard
              key={article.id}
              url={article.url}
              title={article.title}
              status={article.status}
            />
          ))}
        </div>
      </main>
    </>
  );
}
