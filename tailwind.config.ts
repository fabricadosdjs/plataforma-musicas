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
                // Definindo cores para o tema branco/preto
                primary: '#000000', // Preto para textos e elementos principais
                secondary: '#FFFFFF', // Branco para fundos
                accent: '#1E90FF', // Um azul vibrante para botões ou destaques, se necessário
                background: '#FFFFFF', // Fundo principal branco
                text: '#000000', // Cor padrão do texto preto
            },
            fontFamily: {
                // Definindo fontes sans-serif clean
                sans: ['Inter', 'Helvetica Neue', 'Arial', 'sans-serif'],
            },
        },
    },
    plugins: [],
};

export default config;