/// <reference types="vite/client" />

// Extended ambient types (if we need custom env vars later)
interface ImportMetaEnv {
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly BASE_URL: string;
  // Add custom prefixed vars here e.g. VITE_API_BASE
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
