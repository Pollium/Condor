import { defineConfig, Plugin } from 'vite';

const stockApi = (): Plugin => ({
    name: 'demo-stock-api',
    configureServer(server){
        server.middlewares.use('/api/stock', (_req, res) => {
            const failing = Math.random() < 0.3;
            setTimeout(() => {
                res.statusCode = failing ? 500 : 200;
                res.setHeader('content-type', 'application/json');
                res.end(JSON.stringify(failing ? { error: 'Stock::Unavailable' } : { units: Math.floor(Math.random() * 20) + 1 }));
            }, 120 + Math.random() * 300);
        });
    }
});

export default defineConfig({
    plugins: [stockApi()],
    server: { port: 5191, strictPort: true },
    preview: { port: 5191 }
});
