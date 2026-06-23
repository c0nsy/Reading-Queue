'use client';
import { useContext } from "react"
import { ThemeContext } from "./providers/ThemeProvider"

export function ThemeButton(){
    const {theme, setTheme} = useContext(ThemeContext)
    return (
        <button onClick={() => 
            setTheme((prev) => (prev === 'light' ? 'dark': 'light'))
        }>
            Switch to {theme === 'light' ? 'dark' : 'light'} mode
        </button>
    )
}