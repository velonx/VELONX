'use client';

import { useTheme } from './theme-provider';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="relative inline-flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 hover:scale-110 glass-with-border group"
            aria-label="Toggle theme"
        >
            {/* Sun Icon */}
            <Sun
                className={`absolute w-5 h-5 transition-all duration-300 ${theme === 'light'
                        ? 'rotate-0 scale-100 opacity-100 text-amber-500'
                        : 'rotate-90 scale-0 opacity-0'
                    }`}
            />

            {/* Moon Icon */}
            <Moon
                className={`absolute w-5 h-5 transition-all duration-300 ${theme === 'dark'
                        ? 'rotate-0 scale-100 opacity-100 text-blue-400'
                        : '-rotate-90 scale-0 opacity-0'
                    }`}
            />

            {/* Glow effect */}
            <div
                className={`absolute inset-0 rounded-full blur-md opacity-0 group-hover:opacity-50 transition-opacity duration-300 ${theme === 'light' ? 'bg-amber-300' : 'bg-blue-400'
                    }`}
            />
        </button>
    );
}
