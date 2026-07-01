"use client";
import { ThemeProvider } from "./ThemeProvider";
import { ArticleProvider } from "./ArticleProvider";
import { ToolbarProvider } from "./ToolbarProvider";
import { ReactNode } from "react";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <>
      <ThemeProvider>
        <ToolbarProvider>
          <ArticleProvider> {children}</ArticleProvider>
        </ToolbarProvider>
      </ThemeProvider>
    </>
  );
}
