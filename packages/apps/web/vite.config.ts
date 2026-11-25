import { readableConfig } from '@pollium/readable-react/app/vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

export default readableConfig({
    plugins: [react(), tailwindcss()],
    server: {
        port: 5190,
        strictPort: true,
        proxy: {
            '^/i/': {
                target: 'http://localhost:4100',
                changeOrigin: true
            }
        }
    },
    preview: {
        port: 5190
    },
    resolve: {
        dedupe: ['zustand']
    },
    build: {
        chunkSizeWarningLimit: 2000
    }
}, { api: 'http://localhost:4100' });
