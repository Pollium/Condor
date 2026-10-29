export const env = {
    apiUrl: (import.meta.env.VITE_API_URL?.trim() || `${window.location.origin}/api`).replace(/\/+$/, ''),
    ingestUrl: (import.meta.env.VITE_INGEST_URL?.trim() || window.location.origin).replace(/\/+$/, '')
} as const;
