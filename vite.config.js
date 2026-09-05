import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    root: '.',
    publicDir: 'public',
    build: {
      outDir: 'dist',
    },
    server: {
      port: 3000,
      open: true,
    },
    define: {
      // Expose environment variables to client code
      '__AI_ENV__': JSON.stringify({
        apiKey: env.VITE_AI_API_KEY || env.AI_API_KEY || env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY || env.OPENAI_API_KEY || env.VITE_OPENAI_API_KEY || '',
        model: env.VITE_AI_MODEL || env.AI_MODEL || 'gemini-1.5-flash',
        provider: env.VITE_AI_PROVIDER || env.AI_PROVIDER || 'gemini',
        baseUrl: env.VITE_AI_BASE_URL || env.AI_BASE_URL || '',
      }),
    },
  };
});
