export const env = {
    ingestUrl: (import.meta.env.VITE_INGEST_URL?.trim() || window.location.origin).replace(/\/+$/, '')
} as const;
