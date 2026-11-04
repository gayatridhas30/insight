import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  QrCode,
  Download,
  Copy,
  Check,
  ExternalLink,
  Printer,
  Sparkles,
  ArrowLeft,
  Smartphone,
  Laptop,
  Wifi,
  RefreshCw,
  Info,
} from 'lucide-react';
import { eventService } from '../../api/services';

export const QRCodePage = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [targetMode, setTargetMode] = useState('network'); // 'network' | 'local'

  useEffect(() => {
    fetchEventQR();
  }, [id]);

  const fetchEventQR = async () => {
    try {
      setLoading(true);
      const res = await eventService.getEventById(id);
      if (res.data?.success) {
        setEvent(res.data.event);
        setQrData(res.data.qr);
      }
    } catch (err) {
      console.warn('QR fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const activeUrl =
    targetMode === 'network' && qrData?.networkUrl
      ? qrData.networkUrl
      : qrData?.localUrl || `http://localhost:5173/feedback/${event?.code}`;

  const activeQrImage =
    targetMode === 'network' && qrData?.networkDataUrl
      ? qrData.networkDataUrl
      : qrData?.dataUrl;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(activeUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadPNG = () => {
    if (activeQrImage) {
      const a = document.createElement('a');
      a.href = activeQrImage;
      a.download = `InsightLoop-QR-${event?.code || 'event'}-${targetMode}.png`;
      a.click();
    }
  };

  const handlePrintFlyer = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-sm font-semibold text-navy">
        <RefreshCw size={20} className="animate-spin text-coral mr-2" />
        <span>Generating high-resolution QR flyer...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Top Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <Link
            to={`/events/${id}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-charcoal/60 hover:text-navy transition-colors mb-1"
          >
            <ArrowLeft size={14} />
            <span>Back to Event Details</span>
          </Link>
          <h1 className="text-2xl font-heading font-extrabold text-navy">
            Event Feedback QR & Access Link
          </h1>
          <p className="text-xs text-charcoal/60">
            Share this with attendees or display on stage projectors for instant feedback collection
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-charcoal/15 text-xs font-bold text-navy hover:border-coral transition-colors"
          >
            {copied ? <Check size={14} className="text-sage-dark" /> : <Copy size={14} />}
            <span>{copied ? 'Copied!' : 'Copy Link'}</span>
          </button>
          <button
            onClick={handleDownloadPNG}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-navy hover:bg-navy-700 text-white text-xs font-bold transition-colors"
          >
            <Download size={14} />
            <span>Download PNG</span>
          </button>
          <button
            onClick={handlePrintFlyer}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-coral hover:bg-coral-hover text-white text-xs font-bold shadow-coral-glow transition-all active:scale-95"
          >
            <Printer size={14} />
            <span>Print Flyer</span>
          </button>
        </div>
      </div>

      {/* Direct Test in Browser Banner (Solves testing immediately) */}
      <div className="bg-coral/10 border border-coral/30 rounded-3xl p-5 print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-xs uppercase font-extrabold text-coral tracking-wider flex items-center gap-1">
            <Sparkles size={14} />
            <span>Direct Browser Access (No Phone Scanner Needed)</span>
          </span>
          <p className="text-xs text-charcoal/80">
            Testing on this laptop? You can click the button to launch and submit feedback directly in your browser.
          </p>
        </div>

        <a
          href={`/feedback/${event?.code}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-5 py-2.5 rounded-xl bg-coral hover:bg-coral-hover text-white text-xs font-bold shadow-coral-glow flex items-center justify-center gap-2 shrink-0 transition-all active:scale-95"
        >
          <span>Open Form in Browser</span>
          <ExternalLink size={14} />
        </a>
      </div>

      {/* QR Scanning Mode Selector (Network IP vs Localhost) */}
      <div className="bg-white rounded-3xl p-6 border border-charcoal/10 shadow-subtle space-y-4 print:hidden">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-navy flex items-center gap-2">
            <Wifi size={16} className="text-coral" />
            <span>QR Code Destination Target</span>
          </h3>
          <span className="text-[11px] text-charcoal/50">
            Detected Wi-Fi IP: <span className="font-mono font-bold text-navy">{qrData?.networkIp || '172.20.10.2'}</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setTargetMode('network')}
            className={`p-4 rounded-2xl border text-left transition-all flex flex-col gap-1.5 ${
              targetMode === 'network'
                ? 'border-coral bg-coral/5 ring-1 ring-coral/20'
                : 'border-charcoal/15 bg-ivory-50 hover:border-charcoal/30'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-xs text-navy">
                <Smartphone size={15} className="text-coral" />
                <span>Mobile Phone Camera Mode (Wi-Fi)</span>
              </div>
              {targetMode === 'network' && <Check size={14} className="text-coral font-bold" />}
            </div>
            <p className="text-[11px] text-charcoal/60 leading-normal">
              Encodes your local Wi-Fi IP address. Scans from external mobile phones on the same Wi-Fi will open cleanly!
            </p>
            <span className="text-[10px] font-mono text-coral/80 mt-1 truncate">
              {qrData?.networkUrl}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setTargetMode('local')}
            className={`p-4 rounded-2xl border text-left transition-all flex flex-col gap-1.5 ${
              targetMode === 'local'
                ? 'border-navy bg-navy/5 ring-1 ring-navy/20'
                : 'border-charcoal/15 bg-ivory-50 hover:border-charcoal/30'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-xs text-navy">
                <Laptop size={15} className="text-navy" />
                <span>Localhost Mode (Single Computer)</span>
              </div>
              {targetMode === 'local' && <Check size={14} className="text-navy font-bold" />}
            </div>
            <p className="text-[11px] text-charcoal/60 leading-normal">
              Encodes <code className="text-navy">localhost:5173</code>. Suitable when testing directly on this machine.
            </p>
            <span className="text-[10px] font-mono text-charcoal/60 mt-1 truncate">
              {qrData?.localUrl}
            </span>
          </button>
        </div>
      </div>

      {/* Printable Flyer Container */}
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-charcoal/10 shadow-card text-center space-y-6 print:border-none print:shadow-none">
        <div className="flex items-center justify-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-navy text-coral flex items-center justify-center shadow-sm">
            <Sparkles size={20} />
          </div>
          <span className="text-xl font-heading font-extrabold text-navy">
            Insight<span className="text-coral">Loop</span>
          </span>
        </div>

        <div className="space-y-2 max-w-lg mx-auto">
          <span className="text-xs uppercase font-bold tracking-widest text-coral font-mono">
            {event?.code}
          </span>
          <h2 className="text-3xl font-heading font-extrabold text-navy">
            {event?.title}
          </h2>
          <p className="text-sm text-charcoal/70">
            Scan below to share your instant event feedback. Multilingual text & voice supported in English, Hindi, and Marathi.
          </p>
        </div>

        {/* QR Code Container */}
        {activeQrImage && (
          <div className="p-6 bg-ivory rounded-3xl border border-charcoal/10 inline-block shadow-inner">
            <img
              src={activeQrImage}
              alt={`QR Code for ${event?.title}`}
              className="w-64 h-64 rounded-2xl mx-auto shadow-sm"
            />
            <span className="block text-xs font-bold text-navy mt-3 font-mono">
              Event Code: {event?.code}
            </span>
          </div>
        )}

        {/* Instructions & Link */}
        <div className="space-y-2 max-w-md mx-auto pt-2">
          <p className="text-xs font-semibold text-charcoal/70">
            Scan with your phone camera or visit directly:
          </p>
          <a
            href={activeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-3 bg-ivory hover:bg-coral/5 rounded-xl border border-charcoal/10 font-mono text-xs text-coral font-bold break-all transition-colors"
          >
            {activeUrl}
          </a>
        </div>

        <div className="pt-4 border-t border-charcoal/10 flex items-center justify-center gap-6 text-xs text-charcoal/60 font-medium print:text-[10px]">
          <span>✔ No attendee signup required</span>
          <span>✔ Bhashini Voice Recording</span>
          <span>✔ Anonymous submission option</span>
        </div>
      </div>
    </div>
  );
};

export default QRCodePage;
