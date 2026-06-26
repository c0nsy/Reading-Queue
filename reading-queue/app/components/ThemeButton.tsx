'use client';
import { useContext } from "react"
import { ThemeStateContext, ThemeDispatchContext } from "./providers/ThemeProvider"

export function ThemeButton(){
    const theme = useContext(ThemeStateContext)
    const setTheme = useContext(ThemeDispatchContext)
    return (
        <button onClick={() => 
            
            setTheme((prev) => (prev === 'light' ? 'dark': 'light'))
        }>
            Switch to {theme === 'light' ? 'dark' : 'light'} mode
        </button>
    )
}