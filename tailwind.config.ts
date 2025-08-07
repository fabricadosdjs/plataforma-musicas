// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                // Definindo cores para o tema cinza escuro
                primary: '#ffffff', // Branco para textos e elementos principais
                secondary: '#374151', // Cor principal do tema cinza escuro
                accent: '#1f2937', // Cinza mais escuro para elementos de destaque
                background: '#374151', // Fundo principal cinza escuro
                text: '#ffffff', // Cor padrão do texto branco
                'gray-dark': '#374151', // Cinza escuro personalizado
                'gray-darker': '#1f2937', // Cinza mais escuro
                'gray-light': '#6b7280', // Cinza mais claro para hover
            },
            fontFamily: {
                // Definindo Lato como fonte principal
                sans: ['Lato', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
                mono: ['Fira Code', 'Monaco', 'Cascadia Code', 'Roboto Mono', 'monospace'],
            },
            keyframes: {
                slideInLeft: {
                    '0%': {
                        transform: 'translateX(-100%)',
                        opacity: '0'
                    },
                    '100%': {
                        transform: 'translateX(0)',
                        opacity: '1'
                    }
                },
                slideOutLeft: {
                    '0%': {
                        transform: 'translateX(0)',
                        opacity: '1'
                    },
                    '100%': {
                        transform: 'translateX(-100%)',
                        opacity: '0'
                    }
                },
                fadeIn: {
                    '0%': {
                        opacity: '0'
                    },
                    '100%': {
                        opacity: '1'
                    }
                },
                fadeOut: {
                    '0%': {
                        opacity: '1'
                    },
                    '100%': {
                        opacity: '0'
                    }
                }
            },
            animation: {
                'slideInLeft': 'slideInLeft 0.3s ease-out',
                'slideOutLeft': 'slideOutLeft 0.3s ease-in',
                'fadeIn': 'fadeIn 0.2s ease-out',
                'fadeOut': 'fadeOut 0.2s ease-in'
            }
        },
    },
    plugins: [],
};

export default config;