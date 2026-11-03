import QRCode from 'qrcode';

class QRService {
  /**
   * Generate QR Code as Base64 Data URL
   */
  async generateFeedbackQRCode(eventCode, options = {}) {
    const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const feedbackUrl = `${baseUrl}/feedback/${eventCode}`;

    const qrOptions = {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.95,
      margin: options.margin || 2,
      color: {
        dark: options.darkColor || '#17243A', // Midnight Navy default
        light: options.lightColor || '#FFFFFF',
      },
      width: options.width || 400,
    };

    const dataUrl = await QRCode.toDataURL(feedbackUrl, qrOptions);
    return {
      feedbackUrl,
      eventCode,
      dataUrl,
    };
  }

  /**
   * Generate QR Code as SVG vector
   */
  async generateFeedbackQRSVG(eventCode, options = {}) {
    const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const feedbackUrl = `${baseUrl}/feedback/${eventCode}`;

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
