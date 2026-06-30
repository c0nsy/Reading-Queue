"use client";
import { ThemeProvider } from "./ThemeProvider";
import { ArticleProvider } from "./ArticleProvider";
import { ReactNode } from "react";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <>
      <ThemeProvider>
        <ArticleProvider> {children}</ArticleProvider>
      </ThemeProvider>
    </>
  );
}
