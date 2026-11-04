import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  FileText,
  Download,
  Calendar,
  Sparkles,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import { eventService, reportService } from '../../api/services';

export const ReportsPage = () => {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [loading, setLoading] = useState(true);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadingExcel, setDownloadingExcel] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await eventService.getEvents({ limit: 50 });
      if (res.data?.success) {
        const evts = res.data.events || [];
        setEvents(evts);
        if (evts.length > 0) {
          setSelectedEventId(evts[0]._id || evts[0].id);
        }
      }
    } catch (err) {
      console.warn('Events fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!selectedEventId) return;
    try {
      setDownloadingPdf(true);
      const res = await reportService.downloadPDF(selectedEventId);
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `InsightLoop-Report-${currentEvent?.code || selectedEventId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to generate PDF report: ' + (err.response?.data?.message || err.message));
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleDownloadExcel = async () => {
    if (!selectedEventId) return;
    try {
      setDownloadingExcel(true);
      const res = await reportService.downloadExcel(selectedEventId);
      const blob = new Blob([res.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `InsightLoop-Data-${currentEvent?.code || selectedEventId}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to generate Excel report: ' + (err.response?.data?.message || err.message));
    } finally {
      setDownloadingExcel(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-sm font-semibold text-navy">
        <RefreshCw size={20} className="animate-spin text-coral mr-2" />
        <span>Loading report exporter...</span>
      </div>
    );
  }

  const currentEvent = events.find((e) => (e._id || e.id) === selectedEventId);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-heading font-extrabold text-navy">
          Executive Reports & Raw Data Export
        </h1>
        <p className="text-xs text-charcoal/60 mt-0.5">
          Generate publication-ready PDF intelligence summaries and Excel analysis sheets
        </p>
      </div>

      {/* Select Event */}
      <div className="bg-white rounded-3xl p-6 border border-charcoal/10 shadow-subtle space-y-3">
        <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70">
          Select Target Event for Reporting:
        </label>
        <select
          value={selectedEventId}
          onChange={(e) => setSelectedEventId(e.target.value)}
          className="w-full px-4 py-3 rounded-2xl border border-charcoal/15 bg-ivory text-sm font-semibold text-navy focus:outline-none focus:border-coral"
        >
          {events.map((evt) => (
            <option key={evt._id || evt.id} value={evt._id || evt.id}>
              {evt.title} ({evt.code}) • {evt.category} • {evt.responsesCount || 0} Responses
            </option>
          ))}
        </select>
      </div>

      {/* Export Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PDF Executive Report Card */}
        <div className="bg-white rounded-3xl p-8 border border-charcoal/10 shadow-card flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-coral/10 text-coral flex items-center justify-center">
              <FileText size={24} />
            </div>
            <h3 className="text-lg font-heading font-bold text-navy">Executive Intelligence PDF</h3>
            <p className="text-xs text-charcoal/70 leading-relaxed">
              Complete stakeholder-ready PDF report including response rate summary, sentiment distribution breakdown, top positive highlights, recurring friction points, and actionable AI recommendations.
            </p>
          </div>

          <button
            type="button"
            disabled={downloadingPdf || !selectedEventId}
            onClick={handleDownloadPDF}
            className="w-full py-3.5 rounded-xl bg-coral hover:bg-coral-hover text-white text-xs font-bold shadow-coral-glow transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {downloadingPdf ? (
              <RefreshCw size={15} className="animate-spin" />
            ) : (
              <Download size={15} />
            )}
            <span>{downloadingPdf ? 'Generating PDF...' : 'Download PDF Report'}</span>
          </button>
        </div>

        {/* Excel Data Export Card */}
        <div className="bg-white rounded-3xl p-8 border border-charcoal/10 shadow-card flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-sage/20 text-sage-dark flex items-center justify-center">
              <FileSpreadsheet size={24} />
            </div>
            <h3 className="text-lg font-heading font-bold text-navy">Structured Excel Workbook (.xlsx)</h3>
            <p className="text-xs text-charcoal/70 leading-relaxed">
              Multi-tab spreadsheet featuring Event Overview, Participant Response table preserving both original language and Bhashini English translations, rating values, and AI recommendation roadmap.
            </p>
          </div>

          <button
            type="button"
            disabled={downloadingExcel || !selectedEventId}
            onClick={handleDownloadExcel}
            className="w-full py-3.5 rounded-xl bg-navy hover:bg-navy-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {downloadingExcel ? (
              <RefreshCw size={15} className="animate-spin" />
            ) : (
              <Download size={15} />
            )}
            <span>{downloadingExcel ? 'Exporting Spreadsheet...' : 'Download Excel (.xlsx)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
