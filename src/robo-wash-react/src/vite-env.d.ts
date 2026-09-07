/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_2GIS_MAP_KEY: string | undefined;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
