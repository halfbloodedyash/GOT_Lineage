import type { Config } from 'tailwindcss'
import { HOUSE_COLORS } from './lib/constants/house-colors'
import { STATUS_COLORS } from './lib/constants/status-colors'

const config: Config = {
    content: [
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './lib/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                // House Colors - Muted & Gritty
                house: HOUSE_COLORS,
                // Status Colors
                status: STATUS_COLORS,
                // UI Colors - Iron & Gold Theme
                bg: {
                    primary: '#0a0a0a',
                    secondary: '#141414',
                    tertiary: '#1f1f1f',
                },
                surface: {
                    DEFAULT: '#1a1a1a',
                    hover: '#252525',
                },
                border: {
                    DEFAULT: '#4a4a4a',
                    light: '#6a6a6a',
                    gold: '#c9a227',
                },
                text: {
                    primary: '#e0e0e0',
                    secondary: '#a0a0a0',
                    muted: '#666666',
                    accent: '#c9a227',
                },
                accent: {
                    primary: '#c9a227',
                    secondary: '#8a1c1c',
                    glow: 'rgba(201, 162, 39, 0.2)',
                    'glow-strong': 'rgba(201, 162, 39, 0.4)',
                },
                // Relationship Line Colors
                line: {
                    blood: '#c9a227',
                    marriage: '#8a1c1c',
                    secret: '#5a5a5a',
                    betrothed: '#d35400',
                },
            },
            fontFamily: {
                display: ['Cinzel', 'serif'],
                body: ['EB Garamond', 'serif'],
                mono: ['Fira Code', 'monospace'],
            },
            fontSize: {
                xs: '0.75rem',
                sm: '0.875rem',
                base: '1.125rem',
                lg: '1.25rem',
                xl: '1.5rem',
                '2xl': '1.875rem',
                '3xl': '2.25rem',
                '4xl': '3rem',
            },
            spacing: {
                '1': '0.25rem',
                '2': '0.5rem',
                '3': '0.75rem',
                '4': '1rem',
                '5': '1.25rem',
                '6': '1.5rem',
                '8': '2rem',
                '10': '2.5rem',
                '12': '3rem',
                '16': '4rem',
            },
            borderRadius: {
                sm: '2px',
                md: '4px',
                lg: '6px',
                xl: '8px',
            },
            boxShadow: {
                sm: '0 1px 2px rgba(0, 0, 0, 0.5)',
                md: '0 4px 6px rgba(0, 0, 0, 0.6)',
                lg: '0 10px 15px rgba(0, 0, 0, 0.7)',
                xl: '0 20px 25px rgba(0, 0, 0, 0.8)',
                glow: '0 0 15px rgba(201, 162, 39, 0.2)',
            },
            transitionDuration: {
                fast: '150ms',
                base: '300ms',
                slow: '500ms',
            },
            zIndex: {
                base: '1',
                dropdown: '100',
                modal: '200',
                tooltip: '300',
                overlay: '400',
            },
            animation: {
                'fade-in': 'fadeIn 0.3s ease',
                'slide-up': 'slideUp 0.4s ease',
                'pulse-glow': 'pulse 2s infinite',
                glow: 'glow 2s infinite',
            },
            keyframes: {
                fadeIn: {
                    from: { opacity: '0' },
                    to: { opacity: '1' },
                },
                slideUp: {
                    from: { opacity: '0', transform: 'translateY(20px)' },
                    to: { opacity: '1', transform: 'translateY(0)' },
                },
                glow: {
                    '0%, 100%': { boxShadow: '0 0 5px rgba(201, 162, 39, 0.2)' },
                    '50%': { boxShadow: '0 0 20px rgba(201, 162, 39, 0.2), 0 0 40px rgba(201, 162, 39, 0.2)' },
                },
            },
        },
    },
    plugins: [],
}

export default config
