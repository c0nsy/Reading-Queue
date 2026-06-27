'use client';

import React, { useState, createContext, useEffect } from 'react';
import { Theme, ThemeDispatch } from '@/app/types/Theme';

export const ThemeDispatchContext = createContext<ThemeDispatch>(() => {} )
export const ThemeStateContext = createContext<Theme>( 'light')



export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>('light');
 
    useEffect (() => {
        document.documentElement.classList.toggle('dark', theme === 'dark' )
    }, [theme])
    return (
 
            <ThemeDispatchContext.Provider value={setTheme}>
                <ThemeStateContext.Provider value={theme}>
                    {children}
                </ThemeStateContext.Provider>
            </ThemeDispatchContext.Provider>
       
    );
}