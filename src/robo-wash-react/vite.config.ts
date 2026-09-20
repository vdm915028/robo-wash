import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [react(), tailwindcss()],
    // В собранном образе клиент и API живут на одном origin, поэтому запросы к API идут относительным путём.
    // В разработке они разъехались по портам, и этот прокси избавляет от CORS и от переменной с адресом API.
    server: {
        proxy: {
            '/api': 'http://localhost:5287',
        },
    },
});
