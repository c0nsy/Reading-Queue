import { Dispatch, SetStateAction } from "react";

export type Theme = "light" | "dark";

export interface ThemeType {
  theme: Theme;
  setTheme: Dispatch<SetStateAction<Theme>>;
}
