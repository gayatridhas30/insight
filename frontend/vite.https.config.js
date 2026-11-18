import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

// HTTPS dev server (port 5174).
//
// Browsers only expose getUserMedia / Web Speech on *secure contexts*.
// `http://localhost` is treated as secure automatically, but `http://<LAN-IP>`
// is NOT - which is why voice dictation was dead when the page was opened from
// a phone scanning the QR code. Every device that is not this machine must
// therefore use https://<LAN-IP>:5174.
//
// The certificate is self-signed (frontend/scripts/gen-cert.ps1). Your browser
// will show a one-time warning - click Advanced -> Proceed. Once loaded, the
// origin is a secure context and the microphone works normally.

const pfxPath = path.resolve(__dirname, 'certs/dev.pfx');

if (!fs.existsSync(pfxPath)) {
  console.error(
    '\n[https] Missing frontend/certs/dev.pfx\n' +
      '[https] Generate it first:  powershell -ExecutionPolicy Bypass -File frontend\\scripts\\gen-cert.ps1\n' +
      '[https] (start-all.ps1 does this automatically)\n'
  );
  process.exit(1);
}

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Keep the HTTPS server's optimized-deps cache separate from the HTTP one so
  // the two dev servers can run side by side.
  cacheDir: 'node_modules/.vite-https',
  server: {
    host: '0.0.0.0',
    port: Number(process.env.VITE_HTTPS_PORT || 5174),
    https: {
      pfx: fs.readFileSync(pfxPath),
      passphrase: 'insightloop',
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
