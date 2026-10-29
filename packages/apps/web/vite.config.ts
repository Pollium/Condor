import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import typia from '@typia/unplugin/vite';

export default defineConfig({
    plugins: [
        typia({ tsconfig: './tsconfig.app.json', cache: true }),
        react(),
        tailwindcss()
    ],
    server: {
        port: 5190,
        strictPort: true,
        proxy: {
            '^/api/': {
                target: 'http://localhost:4100',
                changeOrigin: true,
                ws: true,
                rewrite: (path) => path.replace(/^\/api/, '')
            },
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
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        },
        dedupe: ['react', 'react-dom', 'react-router', 'react-router-dom', 'zustand', 'alova']
    },
    build: {
        chunkSizeWarningLimit: 2000
    }
});
