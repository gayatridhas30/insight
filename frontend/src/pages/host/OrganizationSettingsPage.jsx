import React, { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  UserPlus,
  Shield,
  Trash2,
  CheckCircle2,
  RefreshCw,
  Mail,
} from 'lucide-react';
import { organizationService } from '../../api/services';
import { useAuth } from '../../context/AuthContext';

export const OrganizationSettingsPage = () => {
  const { activeOrganization } = useAuth();
  const [orgData, setOrgData] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Invite modal
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    if (activeOrganization?.id) {
      fetchOrgDetails();
    }
  }, [activeOrganization]);

  const fetchOrgDetails = async () => {
    try {
      setLoading(true);
      const res = await organizationService.getOrganization(activeOrganization.id);
      if (res.data?.success) {
        setOrgData(res.data.organization);
        setMembers(res.data.members || []);
      }
    } catch (err) {
      console.warn('Org details fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail) return;

    try {
      setInviting(true);
      await organizationService.inviteMember(activeOrganization.id, {
        email: inviteEmail,
        role: inviteRole,
      });
      setIsInviteOpen(false);
      setInviteEmail('');
      fetchOrgDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to invite member');
    } finally {
      setInviting(false);
    }
  };

  const handleRoleChange = async (memberId, newRole) => {
    try {
      await organizationService.updateMemberRole(activeOrganization.id, memberId, { role: newRole });
      fetchOrgDetails();
    } catch (err) {
      alert('Failed to update role');
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (window.confirm('Remove this member from the organization?')) {
      try {
        await organizationService.removeMember(activeOrganization.id, memberId);
        fetchOrgDetails();
      } catch (err) {
        alert('Failed to remove member');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-sm font-semibold text-navy">
        <RefreshCw size={20} className="animate-spin text-coral mr-2" />
        <span>Loading organization settings...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-heading font-extrabold text-navy">
          Organization Settings & Team
        </h1>
        <p className="text-xs text-charcoal/60 mt-0.5">
          Manage your organization profile, permissions, and invited co-hosts
        </p>
      </div>

      {/* Org Profile Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-charcoal/10 shadow-subtle space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-coral/10 text-coral flex items-center justify-center font-bold text-xl">
            {orgData?.name?.[0] || 'O'}
          </div>
          <div>
            <h3 className="text-xl font-heading font-bold text-navy">{orgData?.name}</h3>
            <p className="text-xs text-charcoal/60">
              Slug: <span className="font-mono text-coral">{orgData?.slug}</span> • Category:{' '}
              <span className="capitalize">{orgData?.category}</span>
            </p>
          </div>
        </div>

        {orgData?.description && (
          <p className="text-xs text-charcoal/70 leading-relaxed pt-2 border-t border-charcoal/10">
            {orgData.description}
          </p>
        )}
      </div>

      {/* Members & Co-Hosts Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-charcoal/10 shadow-subtle space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-heading font-bold text-navy">Team Members & Co-Hosts</h3>
            <p className="text-xs text-charcoal/60">Members with access to event analytics and form builders</p>
          </div>

          <button
            onClick={() => setIsInviteOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-coral hover:bg-coral-hover text-white text-xs font-bold shadow-coral-glow transition-all"
          >
            <UserPlus size={14} />
            <span>Invite Co-Host</span>
          </button>
        </div>

        <div className="divide-y divide-charcoal/5">
          {members.map((m) => (
            <div key={m.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-sm font-bold text-navy block">{m.name || 'Invited User'}</span>
                <span className="text-xs text-charcoal/60">{m.email}</span>
              </div>

              <div className="flex items-center gap-3">
                {m.role === 'owner' ? (
                  <span className="text-[11px] font-bold uppercase px-3 py-1 rounded-full bg-coral/10 text-coral">
                    Owner
                  </span>
                ) : (
                  <select
                    value={m.role}
                    onChange={(e) => handleRoleChange(m.id, e.target.value)}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-charcoal/15 bg-ivory text-charcoal"
                  >
                    <option value="admin">Admin</option>
                    <option value="member">Member</option>
                    <option value="analyst">Analyst</option>
                  </select>
                )}

                {m.role !== 'owner' && (
                  <button
                    onClick={() => handleRemoveMember(m.id)}
                    className="p-1.5 text-charcoal/40 hover:text-coral transition-colors"
                    title="Remove member"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invite Member Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 bg-navy/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-card border border-charcoal/10 space-y-4 animate-scaleUp">
            <h3 className="text-lg font-heading font-bold text-navy">Invite Team Member</h3>

            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/40" />
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="coordinator@college.edu"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-charcoal/15 bg-ivory-50 focus:outline-none focus:border-coral"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1">
                  Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-charcoal/15 bg-ivory-50"
                >
                  <option value="admin">Admin (Can edit events & forms)</option>
                  <option value="member">Member (Can view & monitor feedback)</option>
                  <option value="analyst">Analyst (View AI insights & reports only)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsInviteOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-charcoal border border-charcoal/15"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inviting}
                  className="px-5 py-2 rounded-xl bg-coral text-white text-xs font-bold shadow-coral-glow disabled:opacity-50"
                >
                  {inviting ? 'Inviting...' : 'Send Invite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizationSettingsPage;
