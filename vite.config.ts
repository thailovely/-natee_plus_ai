import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { spawn } from 'child_process';

export default defineConfig(({ mode }) => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'express-server',
        configureServer(server) {
          if (process.env.NODE_ENV === 'production') return;
          console.log('Starting Express backend server on port 3001...');
          const proc = spawn('npx', ['tsx', 'server.ts'], {
            stdio: 'inherit',
            shell: true,
            env: { ...process.env, PORT: '3001', NODE_ENV: 'development' }
          });
          server.httpServer?.on('close', () => {
            proc.kill();
          });
        }
      }
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          secure: false,
        }
      }
    },
  };
});
