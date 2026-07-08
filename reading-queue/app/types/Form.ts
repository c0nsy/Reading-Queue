import { Article } from "./Article";

export type FormState =
  | { success: true; article: Article }
  | { success: false; error: string }
  | { success: null };
