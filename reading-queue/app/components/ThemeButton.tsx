'use client';
import { useContext } from "react"
import { ThemeStateContext, ThemeDispatchContext } from "./providers/ThemeProvider"

export function ThemeButton(){
    const theme = useContext(ThemeStateContext)
    const setTheme = useContext(ThemeDispatchContext)
    return (
        <button
            onClick={() =>
                setTheme((prev) => (prev === 'light' ? 'dark': 'light'))
            }
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
            Switch to {theme === 'light' ? 'dark' : 'light'} mode
        </button>
    )
}