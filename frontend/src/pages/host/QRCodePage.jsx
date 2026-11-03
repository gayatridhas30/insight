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
  Share2,
  RefreshCw,
} from 'lucide-react';
import { eventService } from '../../api/services';

export const QRCodePage = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [qr, setQr] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchEventQR();
  }, [id]);

  const fetchEventQR = async () => {
    try {
      setLoading(true);
      const res = await eventService.getEventById(id);
      if (res.data?.success) {
        setEvent(res.data.event);
        setQr(res.data.qr);
      }
    } catch (err) {
      console.warn('QR fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (qr?.feedbackUrl) {
      navigator.clipboard.writeText(qr.feedbackUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDownloadPNG = () => {
    if (qr?.dataUrl) {
      const a = document.createElement('a');
      a.href = qr.dataUrl;
      a.download = `InsightLoop-QR-${event?.code || 'event'}.png`;
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
        <span>Loading QR generator...</span>
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
            <span>Back to Event</span>
          </Link>
          <h1 className="text-2xl font-heading font-extrabold text-navy">
            Event Feedback QR & Flyer
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
            Scan below to share your instant feedback. Multilingual text & voice supported in English, Hindi, and Marathi.
          </p>
        </div>

        {/* QR Code Container */}
        {qr?.dataUrl && (
          <div className="p-6 bg-ivory rounded-3xl border border-charcoal/10 inline-block shadow-inner">
            <img
              src={qr.dataUrl}
              alt={`QR Code for ${event?.title}`}
              className="w-64 h-64 rounded-2xl mx-auto shadow-sm"
            />
            <span className="block text-xs font-bold text-navy mt-3 font-mono">
              Event Code: {event?.code}
            </span>
          </div>
        )}

        <div className="space-y-2 max-w-md mx-auto pt-2">
          <p className="text-xs font-semibold text-charcoal/70">
            Or open directly in your mobile browser:
          </p>
          <div className="p-3 bg-ivory rounded-xl border border-charcoal/10 font-mono text-xs text-navy break-all">
            {qr?.feedbackUrl}
          </div>
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
