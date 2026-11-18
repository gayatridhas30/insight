import React, { useState, useEffect } from 'react';
import { Building2, Search, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { adminService } from '../../api/services';

export const OrganizationManagementPage = () => {
  const { t } = useTranslation();
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      const res = await adminService.getAllOrganizations(params);
      if (res.data?.success) setOrganizations(res.data.organizations || []);
    } catch (err) {
      console.warn('Orgs fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-heading font-extrabold text-navy">
          {t('admin.orgs.title')}
        </h1>
        <p className="text-xs text-charcoal/60 mt-0.5">
          {t('admin.orgs.subtitle')}
        </p>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-charcoal/10 shadow-subtle flex items-center justify-between">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchOrganizations();
          }}
          className="relative w-full sm:w-80"
        >
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('admin.orgs.searchPlaceholder')}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-charcoal/15 bg-ivory-50 focus:outline-none focus:border-coral"
          />
        </form>

        <span className="text-xs text-charcoal/60 font-medium">
          {t('admin.orgs.total', { count: organizations.length })}
        </span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48 text-sm font-semibold text-navy">
          <RefreshCw size={20} className="animate-spin text-coral mr-2" />
          <span>{t('admin.orgs.loading')}</span>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-charcoal/10 shadow-subtle overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-ivory border-b border-charcoal/10 text-charcoal/70 uppercase tracking-wider font-bold">
              <tr>
                <th className="py-3.5 px-4">{t('admin.orgs.headers.organization')}</th>
                <th className="py-3.5 px-4">{t('admin.orgs.headers.slug')}</th>
                <th className="py-3.5 px-4">{t('admin.orgs.headers.category')}</th>
                <th className="py-3.5 px-4">{t('admin.orgs.headers.primaryContact')}</th>
                <th className="py-3.5 px-4">{t('admin.orgs.headers.createdDate')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal/5">
              {organizations.map((org) => (
                <tr key={org._id} className="hover:bg-ivory/50">
                  <td className="py-3.5 px-4 font-bold text-navy">{org.name}</td>
                  <td className="py-3.5 px-4 font-mono text-coral">{org.slug}</td>
                  <td className="py-3.5 px-4 capitalize font-semibold text-charcoal/80">
                    {t(`admin.orgs.categories.${org.category}`, { defaultValue: org.category || '' })}
                  </td>
                  <td className="py-3.5 px-4 text-charcoal/70">
                    {org.createdBy?.name || t('admin.orgs.owner')} ({org.createdBy?.email || t('admin.orgs.na')})
                  </td>
                  <td className="py-3.5 px-4 text-charcoal/50">
                    {new Date(org.createdAt).toLocaleDateString()}
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

export default OrganizationManagementPage;
