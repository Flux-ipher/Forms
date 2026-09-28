const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = {
  getForms: async () => {
    const res = await fetch(`${BASE_URL}/forms`);
    if (!res.ok) throw new Error('Failed to fetch forms');
    return res.json();
  },
  getForm: async (id) => {
    const res = await fetch(`${BASE_URL}/forms/${id}`);
    if (!res.ok) throw new Error('Failed to fetch form');
    return res.json();
  },
  createForm: async (templateData = null) => {
    const res = await fetch(`${BASE_URL}/forms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: templateData ? JSON.stringify(templateData) : JSON.stringify({})
    });
    if (!res.ok) throw new Error('Failed to create form');
    return res.json();
  },
  deleteForm: async (id) => {
    const res = await fetch(`${BASE_URL}/forms/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete form');
    return res.json();
  },
  saveForm: async (id, data) => {
    const res = await fetch(`${BASE_URL}/forms/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to save form');
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
  },
  getAnalytics: async (id) => {
    const res = await fetch(`${BASE_URL}/analytics/${id}`);
    if (!res.ok) throw new Error('Failed to fetch analytics');
    return res.json();
  }
};
