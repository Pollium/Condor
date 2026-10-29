import { defineConfig } from 'vitest/config';

export default defineConfig({
    build: {
        lib: {
            entry: 'src/index.ts',
            formats: ['es'],
            fileName: () => 'index.js'
        },
        emptyOutDir: false,
        sourcemap: true
    },
    test: {
        environment: 'happy-dom',
        include: ['tests/**/*.test.ts'],
        setupFiles: ['./tests/setup.ts']
    }
});
