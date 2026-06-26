import { Dispatch, SetStateAction } from "react";

export type Theme = "light" | "dark";

export type ThemeDispatch = Dispatch<SetStateAction<Theme>>;

export interface ThemeType {
  theme: Theme;
  setTheme: Dispatch<SetStateAction<Theme>>;
}
