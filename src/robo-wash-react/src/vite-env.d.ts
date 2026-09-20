/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_2GIS_MAP_KEY: string | undefined;
    readonly VITE_API_BASE_URL: string | undefined;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
