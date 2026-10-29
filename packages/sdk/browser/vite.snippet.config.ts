import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        lib: {
            entry: 'src/snippet.ts',
            formats: ['iife'],
            name: 'condorSnippet',
            fileName: () => 'condor.js'
        },
        emptyOutDir: false,
        minify: true
    }
});
