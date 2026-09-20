import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [react(), tailwindcss()],
    // В Cloud Run клиент и API — разные сервисы, и адрес API запекается в бандл переменной
    // VITE_API_BASE_URL. Локально она пустая, путь остаётся относительным, и его перекидывает этот прокси:
    // в разработке не нужен ни CORS, ни адрес API в .env.
    server: {
        proxy: {
            '/api': 'http://localhost:5287',
        },
    },
});
