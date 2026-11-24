import typia from '@typia/unplugin/vite';
import { autoValidateBody } from '@pollium/readable/http/auto-validate-body';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    plugins: [
        autoValidateBody(),
        typia({ tsconfig: './tsconfig.json', cache: true })
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
            '@tests': fileURLToPath(new URL('./tests', import.meta.url))
        }
    },
    test: {
        include: ['src/**/*.test.ts'],
        setupFiles: ['./tests/setup.ts'],
        hookTimeout: 60000
    }
});
