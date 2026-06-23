'use client';

import React, { useState, createContext, useEffect } from 'react';
import { Theme, ThemeType } from '@/app/types/Theme';

export const ThemeContext = createContext<ThemeType>({theme: 'light', setTheme: () => {}  })



export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>('light');
    useEffect (() => {
        document.documentElement.classList.toggle('dark', theme === 'dark' )
    }, [theme])
    return (
        <ThemeContext.Provider value={{theme, setTheme}}>
            {children}
        </ThemeContext.Provider>
    );
}