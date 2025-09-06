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
                secondary: '#262626', // Cor principal do tema cinza escuro
                accent: '#1f2937', // Cinza mais escuro para elementos de destaque
                background: '#121212', // Fundo principal cinza escuro
                text: '#ffffff', // Cor padrão do texto branco
                'gray-dark': '#262626', // Cinza escuro personalizado
                'gray-darker': '#121212', // Cinza mais escuro
                'gray-light': '#444444', // Cinza mais claro para hover
                'music-list': '#262626', // Cor específica para lista de música
                'hover-row': '#444444', // Cor específica para hover das rows
            },
            fontFamily: {
                // Definindo Poppins como fonte principal do site
                sans: ['Poppins', 'var(--font-poppins)', 'Inter', 'var(--font-inter)', 'Jost', 'var(--font-jost)', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
                // Adicionando Montserrat para DJ City
                'montserrat': ['Montserrat', 'var(--font-montserrat)', 'sans-serif'],
                // Adicionando Jost como fonte específica
                'jost': ['Jost', 'var(--font-jost)', 'sans-serif'],
                // Adicionando Poppins como fonte específica
                'poppins': ['Poppins', 'var(--font-poppins)', 'sans-serif'],
                // Adicionando Inter como fonte específica
                'inter': ['Inter', 'var(--font-inter)', 'sans-serif'],
                // Adicionando Bebas Neue
                'bebas': ['Bebas Neue', 'cursive'],
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