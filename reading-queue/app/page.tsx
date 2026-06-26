import { ThemeProvider } from "./components/providers/ThemeProvider";
import { SetOnly } from "./components/SetOnly";
import { ThemeButton } from "./components/ThemeButton";
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
      <div>
        <h1>Welcome to the Reading Queue</h1>
        {/* change the theme */}
        <ThemeButton />
        <SetOnly />
      </div>
    </ThemeProvider>
   </>
  );
}
