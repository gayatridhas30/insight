import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, organizationService } from '../api/services';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('insightloop_token') || null);
  const [organizations, setOrganizations] = useState([]);
  const [activeOrganization, setActiveOrganization] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('insightloop_token');
      if (storedToken) {
        try {
          const res = await authService.getMe();
          if (res.data?.success) {
            setUser(res.data.user);
            setOrganizations(res.data.organizations || []);

            const savedOrgId = localStorage.getItem('insightloop_active_org_id');
            const foundOrg = res.data.organizations?.find((o) => o.id === savedOrgId);
            const active = foundOrg || res.data.organizations?.[0] || null;

            setActiveOrganization(active);
            if (active) {
              localStorage.setItem('insightloop_active_org_id', active.id);
            }
          }
        } catch (err) {
          console.warn('Session expired or invalid:', err.message);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authService.login({ email, password });
    if (res.data?.success) {
      const { token: newToken, user: newUser, organizations: userOrgs, activeOrganization: activeOrg } = res.data;
      localStorage.setItem('insightloop_token', newToken);
      setToken(newToken);
      setUser(newUser);
      setOrganizations(userOrgs || []);

      const orgToSet = activeOrg || userOrgs?.[0] || null;
      setActiveOrganization(orgToSet);
      if (orgToSet) {
        localStorage.setItem('insightloop_active_org_id', orgToSet.id);
      }
      return res.data;
    }
  };

  const register = async (formData) => {
    const res = await authService.register(formData);
    if (res.data?.success) {
      const { token: newToken, user: newUser, organization } = res.data;
      localStorage.setItem('insightloop_token', newToken);
      setToken(newToken);
      setUser(newUser);
      if (organization) {
        setOrganizations([organization]);
        setActiveOrganization(organization);
        localStorage.setItem('insightloop_active_org_id', organization.id);
      }
      return res.data;
    }
  };

  const switchOrganization = (org) => {
    setActiveOrganization(org);
    localStorage.setItem('insightloop_active_org_id', org.id);
  };

  const logout = () => {
    localStorage.removeItem('insightloop_token');
    localStorage.removeItem('insightloop_active_org_id');
    setToken(null);
    setUser(null);
    setOrganizations([]);
    setActiveOrganization(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        organizations,
        activeOrganization,
        loading,
        login,
        register,
        logout,
        switchOrganization,
        isAuthenticated: Boolean(token && user),
        isAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
