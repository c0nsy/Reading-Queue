"use client";

import { useArticles } from "./hooks/useArticles";

import { ThemeButton } from "./components/ThemeButton";
import { Toolbar } from "./components/Toolbar";
import { Loading } from "./components/Loading";
import ArticleCard from "./components/ArticleCard";
import { ErrorMessage } from "./components/ErrorMessage";
import { Sortable } from "./components/wrappers/Sortable";
import { useContext, useState } from "react";
import {
  ArticleDispatchContext,
  ArticleStateContext,
} from "./components/providers/ArticleProvider";
import { DragDropProvider } from "@dnd-kit/react";
import { ErrorBanner } from "./components/errors/ErrorBanner";

export default function Home() {
  const { articles, isLoading, error } = useArticles();
  const dispatch = useContext(ArticleDispatchContext);
  const { order, status } = useContext(ArticleStateContext);
  const [updateError, setUpdateError] = useState<string | null>(null);
  return (
    <>
      <main className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-12">
        {updateError && (
          <ErrorBanner
            message={updateError}
            onDismiss={() => {
              setUpdateError("");
            }}
          />
        )}
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
        <DragDropProvider
          onDragEnd={(event) => {
            const { source, target } = event.operation;
            if (event.canceled || !source || !target || source.id === target.id)
              return;
            dispatch({
              type: "order",
              sourceId: String(source.id),
              targetId: String(target.id),
            });
          }}
        >
          <div className="flex flex-col gap-3">
            {/* loads slow cause we need to paginate  */}
            {order
              .slice(0, 50)
              .map((id) => articles.find((a) => a.id === id))
              .filter((a) => a !== undefined)
              .map((article, index) => (
                <Sortable key={article.id} id={article.id} index={index}>
                  <ArticleCard
                    url={article.url}
                    title={article.title}
                    status={status[article.id] ?? article.status}
                    id={article.id}
                    onError={setUpdateError}
                  />
                </Sortable>
              ))}
          </div>
        </DragDropProvider>
      </main>
    </>
  );
}
