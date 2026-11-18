import QRCode from 'qrcode';
import os from 'os';

const VIRTUAL_INTERFACE_PATTERNS = [
  'vethernet',
  'hyper-v',
  'vmware',
  'virtualbox',
  'vboxnet',
  'wsl',
  'loopback',
  'teredo',
  'isatap',
  'bridge',
  'bluetooth',
  'npcap',
  'docker',
  'minikube',
  'tailscale',
  'zerotier',
  'hamachi',
  'vpn',
];

function isVirtualInterface(name) {
  const lower = String(name).toLowerCase();
  return VIRTUAL_INTERFACE_PATTERNS.some((pattern) => lower.includes(pattern));
}

function lanScore(address) {
  if (address.startsWith('192.168.')) return 3;
  if (address.startsWith('10.')) return 2;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(address)) return 1;
  return 0;
}

/**
 * Returns the LAN IP address that phones on the same Wi-Fi can actually reach.
 * Virtual adapters (Hyper-V, VMware, WSL, Docker, ...) and link-local
 * 169.254.x.x addresses are skipped so the QR never points at an unreachable host.
 * Set QR_BASE_URL to override the generated public URL entirely.
 */
export function getNetworkIp() {
  const interfaces = os.networkInterfaces();
  const candidates = [];

  for (const name of Object.keys(interfaces)) {
    if (isVirtualInterface(name)) continue;
    for (const iface of interfaces[name] || []) {
      const family = iface.family;
      if (family !== 'IPv4' && family !== 4) continue;
      if (iface.internal) continue;
      if (iface.address.startsWith('169.254.')) continue;
      candidates.push(iface.address);
    }
  }

  if (candidates.length === 0) return 'localhost';

  candidates.sort((a, b) => lanScore(b) - lanScore(a));
  return candidates[0];
}

// Browsers only expose getUserMedia / Web Speech on secure contexts.
// `http://localhost` qualifies automatically, `http://<LAN-IP>` does not -
// so anything a phone scans must point at the HTTPS dev server.
const HTTPS_PORT = Number(process.env.QR_HTTPS_PORT || 5174);
const HTTP_PORT = Number(process.env.QR_PORT || 5173);

function resolveBaseHost() {
  if (process.env.QR_BASE_URL) {
    return process.env.QR_BASE_URL.replace(/\/+$/, '');
  }
  const ip = getNetworkIp();
  if (ip !== 'localhost') return `https://${ip}:${HTTPS_PORT}`;
  if (process.env.CLIENT_URL) return process.env.CLIENT_URL.replace(/\/+$/, '');
  return `https://localhost:${HTTPS_PORT}`;
}

class QRService {
  /**
   * Generate QR Code as Base64 Data URL with both local and network URLs
   */
  async generateFeedbackQRCode(eventCode, options = {}) {
    const networkIp = getNetworkIp();
    const port = options.port || HTTP_PORT;
    
    // localUrl is only ever opened in this machine's own browser, where plain
    // http://localhost is already a secure context - so it stays on port 5173.
    const localUrl = `http://localhost:${port}/feedback/${eventCode}`;
    const networkUrl = `${resolveBaseHost()}/feedback/${eventCode}`;

    // If preferredHost is 'local', encode localUrl; otherwise encode networkUrl so mobile phones on the same Wi-Fi can open it!
    const feedbackUrl = options.hostType === 'local' ? localUrl : networkUrl;

    const qrOptions = {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.95,
      margin: options.margin || 2,
      color: {
        dark: options.darkColor || '#17243A', // Midnight Navy
        light: options.lightColor || '#FFFFFF',
      },
      width: options.width || 400,
    };

    const dataUrl = await QRCode.toDataURL(feedbackUrl, qrOptions);
    const localDataUrl = await QRCode.toDataURL(localUrl, qrOptions);
    const networkDataUrl = await QRCode.toDataURL(networkUrl, qrOptions);

    return {
      feedbackUrl,
      localUrl,
      networkUrl,
      networkIp,
      eventCode,
      dataUrl,
      localDataUrl,
      networkDataUrl,
    };
  }

  /**
   * Generate QR Code as SVG vector
   */
  async generateFeedbackQRSVG(eventCode, options = {}) {
    const port = options.port || HTTP_PORT;
    const feedbackUrl = options.hostType === 'local' 
      ? `http://localhost:${port}/feedback/${eventCode}`
      : `${resolveBaseHost()}/feedback/${eventCode}`;

    const svgString = await QRCode.toString(feedbackUrl, {
      type: 'svg',
      color: {
        dark: options.darkColor || '#17243A',
        light: options.lightColor || '#FFFFFF',
      },
      margin: options.margin || 2,
    });

    return {
      feedbackUrl,
      eventCode,
      svg: svgString,
    };
  }
}

export const qrService = new QRService();
