/// <reference types="vite/client" />

interface ImportMetaEnv{
    readonly VITE_CONDOR_KEY?: string;
    readonly VITE_CONDOR_HOST?: string;
}

interface ImportMeta{
    readonly env: ImportMetaEnv;
}
