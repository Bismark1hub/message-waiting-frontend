const API_BASE = import.meta.env.VITE_API_BASE || '/.netlify/functions';

export const api = {
  async getLines() {
    const res = await fetch(`${API_BASE}/get-lines`);
    if (!res.ok) throw new Error('Failed to fetch lines');
    return res.json();
  },
  async getLine(slug, page = 1, limit = 20) {
    const res = await fetch(
      `${API_BASE}/get-line?slug=${encodeURIComponent(slug)}&page=${page}&limit=${limit}`
    );
    if (!res.ok) {
      if (res.status === 404) throw new Error('not-found');
      throw new Error('Failed to fetch line');
    }
    return res.json();
  },
  async postMessage(line_id, text) {
    const res = await fetch(`${API_BASE}/post-message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ line_id, text }),
    });
    if (!res.ok) throw new Error('Failed to post message');
    return res.json();
  },
  async relateMessage(message_id) {
    const res = await fetch(`${API_BASE}/relate-message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message_id }),
    });
    if (!res.ok) throw new Error('Failed to relate');
    return res.json();
  },
  async reportMessage(message_id) {
    const res = await fetch(`${API_BASE}/report-message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message_id }),
    });
    if (!res.ok) throw new Error('Failed to report');
    return res.json();
  },
  async adminLogin(passphrase) {
    const res = await fetch(`${API_BASE}/admin-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ passphrase }),
    });
    if (!res.ok) throw new Error('Invalid passphrase');
    return res.json();
  },
  async adminCreateLine(question, slug, token) {
    const res = await fetch(`${API_BASE}/admin-create-line`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ question, slug }),
    });
    if (!res.ok) throw new Error('Failed to create line');
    return res.json();
  },
  async adminUpdateLine(line_id, updates, token) {
    const res = await fetch(`${API_BASE}/admin-update-line`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ line_id, ...updates }),
    });
    if (!res.ok) throw new Error('Failed to update line');
    return res.json();
  },
  async adminListReports(token) {
    const res = await fetch(`${API_BASE}/admin-list-reports`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch reports');
    return res.json();
  },
  async adminResolveReport(message_id, action, token) {
    const res = await fetch(`${API_BASE}/admin-resolve-report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ message_id, action }),
    });
    if (!res.ok) throw new Error('Failed to resolve report');
    return res.json();
  },
};
