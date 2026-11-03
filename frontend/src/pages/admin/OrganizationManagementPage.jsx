import React, { useState, useEffect } from 'react';
import { Building2, Search, RefreshCw, CheckCircle2 } from 'lucide-react';
import { adminService } from '../../api/services';

export const OrganizationManagementPage = () => {
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
          Organization Directory
        </h1>
        <p className="text-xs text-charcoal/60 mt-0.5">
          Colleges, academic clubs, enterprises, and communities onboarded to InsightLoop
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
            placeholder="Search organization or slug..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-charcoal/15 bg-ivory-50 focus:outline-none focus:border-coral"
          />
        </form>

        <span className="text-xs text-charcoal/60 font-medium">
          {organizations.length} Organizations Total
        </span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48 text-sm font-semibold text-navy">
          <RefreshCw size={20} className="animate-spin text-coral mr-2" />
          <span>Loading organizations...</span>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-charcoal/10 shadow-subtle overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-ivory border-b border-charcoal/10 text-charcoal/70 uppercase tracking-wider font-bold">
              <tr>
                <th className="py-3.5 px-4">Organization</th>
                <th className="py-3.5 px-4">Slug Identifier</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Primary Contact</th>
                <th className="py-3.5 px-4">Created Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal/5">
              {organizations.map((org) => (
                <tr key={org._id} className="hover:bg-ivory/50">
                  <td className="py-3.5 px-4 font-bold text-navy">{org.name}</td>
                  <td className="py-3.5 px-4 font-mono text-coral">{org.slug}</td>
                  <td className="py-3.5 px-4 capitalize font-semibold text-charcoal/80">{org.category}</td>
                  <td className="py-3.5 px-4 text-charcoal/70">
                    {org.createdBy?.name || 'Owner'} ({org.createdBy?.email || 'N/A'})
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
