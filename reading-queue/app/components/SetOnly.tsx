'use client';
import { useContext } from "react"
import { ThemeDispatchContext } from "./providers/ThemeProvider"



export function SetOnly(){
    const setTheme = useContext(ThemeDispatchContext)
    console.log('SetOnly rendered')
    function handleOnClick(){
        console.log("SetOnly clicked, triggering setter")
        setTheme((prev) => (prev === 'light' ? 'dark': 'light'))
    }
    return(
        <>
            <button onClick={handleOnClick}>SetOnly</button>
        </>
    )
}