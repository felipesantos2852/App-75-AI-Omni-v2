import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    define: {
      // This allows the app to use `process.env.API_KEY` in the browser
      // It maps the VITE_API_KEY environment variable to process.env.API_KEY
      'process.env.API_KEY': JSON.stringify(process.env.VITE_API_KEY || process.env.API_KEY)
    },
    server: {
      port: 3000
    }
  };
});