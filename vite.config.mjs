
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default async () => {
  // Optional: can dynamically import tagger if needed later
  // const { componentTagger } = await import('lovable-tagger');

  return defineConfig({
    plugins: [
      react()
      // , componentTagger()  ← uncomment if needed later
    ],
    server: {
      port: 8080,
      host: '::'
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    }
  });
};
