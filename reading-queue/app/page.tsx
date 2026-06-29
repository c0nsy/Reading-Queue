import { ThemeProvider } from "./components/providers/ThemeProvider";
import { ThemeButton } from "./components/ThemeButton";
import { Toolbar } from "./components/Toolbar";
// import { ArticleAction } from "./types/Action";

export default function Home() {
  // function assertUnreachable(x: never): void {
  //   throw new Error(`Unexpected object: ${x}`);
  // }
  // function handleAction(action: ArticleAction) {
  //   switch (action.type) {
  //     case "sort":
  //       // Handle sort action
  //       console.log(`Sorting by ${action.sortBy}`);
  //       break;
  //     case "search":
  //       // Handle search action
  //       console.log(`Searching for: ${action.query}`);
  //       break;
  //     case "status":
  //       // Handle status filter action
  //       console.log(`Filtering by status: ${action.status}`);
  //       break;
  //     case "tags":
  //       // Handle tags action
  //       console.log(`Filtering by tags: ${action.tags.join(", ")}`);
  //       break;

  //     default:
  //        // satifies never
  //       assertUnreachable(action);
  //   }
  // }
  return (
    // wrap this in our themeprovider
    //  we will use the useContext hook to get the theme and apply it to our components
    <>
      <ThemeProvider>
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
      </ThemeProvider>
    </>
  );
}
