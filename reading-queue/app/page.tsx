"use client";

import { useArticles } from "./hooks/useArticles";

import { ThemeButton } from "./components/ThemeButton";
import { Toolbar } from "./components/Toolbar";
import { Loading } from "./components/Loading";
import ArticleCard from "./components/ArticleCard";
import { ErrorMessage } from "./components/ErrorMessage";
import { Sortable } from "./components/wrappers/Sortable";
import { useContext, useState, useActionState, Suspense } from "react";
import {
  ArticleDispatchContext,
  ArticleStateContext,
} from "./components/providers/ArticleProvider";
import { DragDropProvider } from "@dnd-kit/react";
import { Banner } from "./components/Banner";
import { ArticleForm } from "./components/ArticleForm";
import { BannerType } from "./types/Banner";
import { createArticle } from "./services/createArticle";
import { ErrorBoundary } from "./boundaries/ErrorBoundary";
import { lazy } from "react";

const ReaderView = lazy(() => import("./components/ReaderView"));

export default function Home() {
  const { articles, isLoading, error } = useArticles();
  const dispatch = useContext(ArticleDispatchContext);
  const { order, status } = useContext(ArticleStateContext);
  const [banner, setBanner] = useState<BannerType | null>(null);
  const [articleId, setArticleId] = useState("");
  async function handleFormSubmit(prevState: void, formData: FormData) {
    const articleUrl = (formData.get("url") ?? "").toString();
    try {
      const result = await createArticle(articleUrl);

      setBanner({ variant: "success", message: result });
    } catch (err) {
      setBanner({ variant: "error", message: String(err) });
    }
  }

  const [state, formAction, isPending] = useActionState(
    handleFormSubmit,
    undefined,
  );

  return (
    <>
      <main className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-12">
        {banner && (
          <Banner
            message={banner.message}
            onDismiss={() => {
              setBanner(null);
            }}
            variant={banner.variant}
          />
        )}
        <header className="flex items-center justify-between border-b border-zinc-200 pb-4 dark:border-zinc-800">
          <h1 className="text-2xl font-semibold tracking-tight">
            Reading Queue
          </h1>

          <ThemeButton />
        </header>
        <ArticleForm isPending={isPending} formAction={formAction} />
        <Toolbar />
        <Loading loading={isLoading} />
        <ErrorMessage error={error} />
        {articleId !== "" && (
          <ErrorBoundary
            fallback={
              <Banner variant="error" message="Failed to render readingview " />
            }
            key={articleId}
          >
            <Suspense fallback={<Loading loading />}>
              <ReaderView id={articleId} onClose={() => setArticleId("")} />
            </Suspense>
          </ErrorBoundary>
        )}
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
                    onError={(message) => {
                      setBanner({ variant: "error", message });
                    }}
                    openReaderView={(id) => {
                      setArticleId(id);
                    }}
                  />
                </Sortable>
              ))}
          </div>
        </DragDropProvider>
      </main>
    </>
  );
}
