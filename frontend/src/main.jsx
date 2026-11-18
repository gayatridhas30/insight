import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles/index.css';
import './i18n';

// Speech-to-text needs navigator.mediaDevices, and browsers only expose that
// on a secure context. `http://localhost` counts as one; `http://<LAN-IP>` does
// not. If someone opens the plain-HTTP dev server from another device (or from
// a bookmark built from the LAN IP), bounce them to the HTTPS dev server so the
// microphone works instead of failing silently.
try {
  const { protocol, hostname, port, pathname, search, hash } = window.location;
  const isLoopback =
    hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]';
  const httpsPort = import.meta.env.VITE_HTTPS_PORT || '5174';
  if (protocol === 'http:' && !isLoopback && port === '5173') {
    window.location.replace(`https://${hostname}:${httpsPort}${pathname}${search}${hash}`);
  }
} catch {
  // Never let the redirect guard break app startup.
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
