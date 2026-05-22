import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'mock-api',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/api/appointments' && req.method === 'POST') {
            let body = '';
            req.on('data', (chunk) => {
              body += chunk.toString();
            });
            req.on('end', () => {
              try {
                const data = JSON.parse(body);
                const filePath = path.resolve(__dirname, './src/mock/appointments.json');
                const appointments = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
                // Append the new appointment
                appointments.push(data);
                fs.writeFileSync(filePath, JSON.stringify(appointments, null, 2));
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(data));
              } catch (e) {
                res.statusCode = 500;
                res.end('error');
              }
            });
            return;
          }
          if (req.url?.startsWith('/api/appointments/') && req.method === 'PUT') {
            const id = parseInt(req.url.split('/').pop() || '0', 10);
            let body = '';
            req.on('data', (chunk) => {
              body += chunk.toString();
            });
            req.on('end', () => {
              try {
                const data = JSON.parse(body);
                const filePath = path.resolve(__dirname, './src/mock/appointments.json');
                const appointments = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
                const index = appointments.findIndex((a: any) => a.id === id);
                if (index !== -1) {
                  appointments[index] = { ...appointments[index], ...data };
                  fs.writeFileSync(filePath, JSON.stringify(appointments, null, 2));
                }
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(appointments[index] || {}));
              } catch (e) {
                res.statusCode = 500;
                res.end('error');
              }
            });
            return;
          }
          next();
        });
      },
    },
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
