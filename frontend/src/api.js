const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = (extraHeaders = {}) => {
  const token = localStorage.getItem('formflow_admin_auth');
  return {
    ...extraHeaders,
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

export const api = {
  verifyAdminCode: async (code) => {
    const res = await fetch(`${BASE_URL}/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });
    if (!res.ok) throw new Error('Invalid code');
    return res.json();
  },
  
  // PROTECTED ROUTES
  getForms: async () => {
    const res = await fetch(`${BASE_URL}/forms`, { headers: getAuthHeaders() });
    if (res.status === 401) throw new Error('Unauthorized');
    if (!res.ok) throw new Error('Failed to fetch forms');
    return res.json();
  },
  createForm: async (templateData = null) => {
    const res = await fetch(`${BASE_URL}/forms`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: templateData ? JSON.stringify(templateData) : JSON.stringify({})
    });
    if (res.status === 401) throw new Error('Unauthorized');
    if (!res.ok) throw new Error('Failed to create form');
    return res.json();
  },
  deleteForm: async (id) => {
    const res = await fetch(`${BASE_URL}/forms/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (res.status === 401) throw new Error('Unauthorized');
    if (!res.ok) throw new Error('Failed to delete form');
    return res.json();
  },
  saveForm: async (id, data) => {
    const res = await fetch(`${BASE_URL}/forms/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data)
    });
    if (res.status === 401) throw new Error('Unauthorized');
    if (!res.ok) throw new Error('Failed to save form');
    return res.json();
  },
  getAnalytics: async (id) => {
    const res = await fetch(`${BASE_URL}/analytics/${id}`, { headers: getAuthHeaders() });
    if (res.status === 401) throw new Error('Unauthorized');
    if (!res.ok) throw new Error('Failed to fetch analytics');
    return res.json();
  },
  deleteAllResponses: async (id) => {
    const res = await fetch(`${BASE_URL}/forms/${id}/submissions`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (res.status === 401) throw new Error('Unauthorized');
    if (!res.ok) throw new Error('Failed to delete responses');
    return res.json();
  },

  // PUBLIC ROUTES (No Auth Required)
  getForm: async (id) => {
    const res = await fetch(`${BASE_URL}/forms/${id}`);
    if (!res.ok) throw new Error('Failed to fetch form');
    return res.json();
  },
  submitForm: async (id, answers) => {
    const res = await fetch(`${BASE_URL}/submissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ form_id: id, answers })
    });
    if (!res.ok) throw new Error('Failed to submit form');
    return res.json();
  }
};
