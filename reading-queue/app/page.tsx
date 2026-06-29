import { ThemeProvider } from "./components/providers/ThemeProvider";
import { ThemeButton } from "./components/ThemeButton";
import { Toolbar } from "./components/Toolbar";

export default function Home() {
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
      </main>
    </>
  );
}
