import React, { useState, useEffect } from 'react';
import { FileText, Search, RefreshCw, Activity, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { adminService } from '../../api/services';

export const AuditLogsPage = () => {
  const { t } = useTranslation();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');

  useEffect(() => {
    fetchAuditLogs();
  }, [actionFilter]);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const params = {};
      if (actionFilter) params.action = actionFilter;
      const res = await adminService.getAuditLogs(params);
      if (res.data?.success) setLogs(res.data.logs || []);
    } catch (err) {
      console.warn('Audit logs fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-heading font-extrabold text-navy">
          {t('admin.audit.title')}
        </h1>
        <p className="text-xs text-charcoal/60 mt-0.5">
          {t('admin.audit.subtitle')}
        </p>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-charcoal/10 shadow-subtle flex items-center justify-between">
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="px-3 py-2 text-xs font-semibold rounded-xl border border-charcoal/15 bg-ivory-50 text-charcoal"
        >
          <option value="">{t('admin.audit.allActions')}</option>
          <option value="USER_LOGIN">USER_LOGIN</option>
          <option value="USER_REGISTERED">USER_REGISTERED</option>
          <option value="EVENT_CREATED">EVENT_CREATED</option>
          <option value="AI_ANALYSIS_EXECUTED">AI_ANALYSIS_EXECUTED</option>
          <option value="RAG_QUERY_EXECUTED">RAG_QUERY_EXECUTED</option>
          <option value="ADMIN_TOGGLE_USER_STATUS">ADMIN_TOGGLE_USER_STATUS</option>
        </select>

        <span className="text-xs text-charcoal/60 font-medium">
          {t('admin.audit.recordedEntries', { count: logs.length })}
        </span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48 text-sm font-semibold text-navy">
          <RefreshCw size={20} className="animate-spin text-coral mr-2" />
          <span>{t('admin.audit.loading')}</span>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-charcoal/10 shadow-subtle overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-ivory border-b border-charcoal/10 text-charcoal/70 uppercase tracking-wider font-bold">
              <tr>
                <th className="py-3.5 px-4">{t('admin.audit.headers.action')}</th>
                <th className="py-3.5 px-4">{t('admin.audit.headers.resource')}</th>
                <th className="py-3.5 px-4">{t('admin.audit.headers.actor')}</th>
                <th className="py-3.5 px-4">{t('admin.audit.headers.organization')}</th>
                <th className="py-3.5 px-4">{t('admin.audit.headers.ipAddress')}</th>
                <th className="py-3.5 px-4">{t('admin.audit.headers.timestamp')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal/5">
              {logs.map((log) => (
                <tr key={log._id} className="hover:bg-ivory/50">
                  <td className="py-3.5 px-4 font-mono font-bold text-coral">{log.action}</td>
                  <td className="py-3.5 px-4 font-semibold text-navy">{log.resourceType}</td>
                  <td className="py-3.5 px-4 text-charcoal/80">
                    {log.userId?.name || t('admin.audit.systemAnonymous')}
                  </td>
                  <td className="py-3.5 px-4 text-charcoal/60">
                    {log.organizationId?.name || t('admin.audit.global')}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-charcoal/50 text-[11px]">
                    {log.ipAddress || '127.0.0.1'}
                  </td>
                  <td className="py-3.5 px-4 text-charcoal/50 text-[11px]">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AuditLogsPage;
