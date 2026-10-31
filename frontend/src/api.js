const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const getAuthToken = () => localStorage.getItem('civic_auth_token');
export const setAuthToken = (token) => localStorage.getItem('civic_auth_token', token);
export const removeAuthToken = () => localStorage.removeItem('civic_auth_token');

export const getStoredUser = () => {
  const u = localStorage.getItem('civic_user');
  return u ? JSON.parse(u) : null;
};

const authHeaders = () => {
  const token = localStorage.getItem('civic_auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const api = {
  // Auth
  async login(email, password) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Login failed');
    localStorage.setItem('civic_auth_token', data.access_token);
    localStorage.setItem('civic_user', JSON.stringify(data.user));
    return data;
  },

  async register(userData) {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Registration failed');
    localStorage.setItem('civic_auth_token', data.access_token);
    localStorage.setItem('civic_user', JSON.stringify(data.user));
    return data;
  },

  logout() {
    localStorage.removeItem('civic_auth_token');
    localStorage.removeItem('civic_user');
  },

  // Complaints
  async getComplaints(filters = {}) {
    const params = new URLSearchParams();
    if (filters.category) params.append('category', filters.category);
    if (filters.status) params.append('status', filters.status);
    if (filters.severity) params.append('severity', filters.severity);
    if (filters.search) params.append('search', filters.search);
    if (filters.sort_by) params.append('sort_by', filters.sort_by);

    const res = await fetch(`${API_BASE_URL}/complaints/?${params.toString()}`, {
      headers: { ...authHeaders() }
    });
    if (!res.ok) throw new Error('Failed to fetch complaints');
    return res.json();
  },

  async getComplaint(id) {
    const res = await fetch(`${API_BASE_URL}/complaints/${id}`, {
      headers: { ...authHeaders() }
    });
    if (!res.ok) throw new Error('Failed to fetch complaint detail');
    return res.json();
  },

  async getMapMarkers(category = null) {
    const url = category ? `${API_BASE_URL}/complaints/map?category=${category}` : `${API_BASE_URL}/complaints/map`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch map markers');
    return res.json();
  },

  async createComplaint(formData) {
    const res = await fetch(`${API_BASE_URL}/complaints/`, {
      method: 'POST',
      headers: {
        ...authHeaders()
      },
      body: formData
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Failed to submit grievance');
    return data;
  },

  async vote(complaintId, voteType) {
    const res = await fetch(`${API_BASE_URL}/complaints/${complaintId}/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders()
      },
      body: JSON.stringify({ vote_type: voteType })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Vote failed');
    return data;
  },

  async updateStatus(complaintId, status, notes = '') {
    const res = await fetch(`${API_BASE_URL}/complaints/${complaintId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders()
      },
      body: JSON.stringify({ status, admin_notes: notes })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Failed to update status');
    return data;
  },

  // Analytics
  async getAnalytics() {
    const res = await fetch(`${API_BASE_URL}/analytics/summary`);
    if (!res.ok) throw new Error('Failed to fetch civic analytics');
    return res.json();
  },

  // Agent
  async triggerAgent(complaintId = null) {
    const res = await fetch(`${API_BASE_URL}/agent/trigger`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders()
      },
      body: JSON.stringify({ complaint_id: complaintId })
    });
    return res.json();
  },

  async getAgentLogs() {
    const res = await fetch(`${API_BASE_URL}/agent/logs`);
    if (!res.ok) throw new Error('Failed to fetch agent logs');
    return res.json();
  },

  async getAgentStatus() {
    const res = await fetch(`${API_BASE_URL}/agent/status`);
    return res.json();
  }
};
