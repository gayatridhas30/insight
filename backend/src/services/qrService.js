import QRCode from 'qrcode';
import os from 'os';

export function getNetworkIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

class QRService {
  /**
   * Generate QR Code as Base64 Data URL with both local and network URLs
   */
  async generateFeedbackQRCode(eventCode, options = {}) {
    const networkIp = getNetworkIp();
    const port = options.port || 5173;
    
    // Choose base URL: custom passed, or network IP if available, or CLIENT_URL
    const localUrl = `http://localhost:${port}/feedback/${eventCode}`;
    const networkUrl = networkIp !== 'localhost' 
      ? `http://${networkIp}:${port}/feedback/${eventCode}`
      : (process.env.CLIENT_URL || localUrl);

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
    const networkIp = getNetworkIp();
    const port = options.port || 5173;
    const feedbackUrl = options.hostType === 'local' 
      ? `http://localhost:${port}/feedback/${eventCode}`
      : `http://${networkIp}:${port}/feedback/${eventCode}`;

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
