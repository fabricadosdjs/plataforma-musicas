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
                // Definindo cores para o tema escuro
                primary: '#ffffff', // Branco para textos e elementos principais
                secondary: '#202124', // Cor principal do tema escuro
                accent: '#000000', // Preto para elementos de destaque
                background: '#202124', // Fundo principal
                text: '#ffffff', // Cor padrão do texto branco
            },
            fontFamily: {
                // Definindo Lato como fonte principal
                sans: ['Lato', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
                mono: ['Fira Code', 'Monaco', 'Cascadia Code', 'Roboto Mono', 'monospace'],
            },
        },
    },
    plugins: [],
};

export default config;