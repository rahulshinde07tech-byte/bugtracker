const API_BASE = '/api';

export const api = {
  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    return res.json();
  },

  async getApps() {
    const res = await fetch(`${API_BASE}/apps`);
    return res.json();
  },

  async createApp(appData) {
    const res = await fetch(`${API_BASE}/apps`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(appData)
    });
    return res.json();
  },

  async getBugs(filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        params.append(key, val);
      }
    });
    const url = `${API_BASE}/bugs${params.toString() ? '?' + params.toString() : ''}`;
    const res = await fetch(url);
    return res.json();
  },

  async createBug(bugData) {
    const res = await fetch(`${API_BASE}/bugs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bugData)
    });
    return res.json();
  },

  async updateBug(id, bugData) {
    const res = await fetch(`${API_BASE}/bugs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bugData)
    });
    return res.json();
  },

  async deleteBug(id) {
    const res = await fetch(`${API_BASE}/bugs/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  async getTeam() {
    const res = await fetch(`${API_BASE}/team`);
    return res.json();
  },

  async syncSheets() {
    const res = await fetch(`${API_BASE}/sync`, {
      method: 'POST'
    });
    return res.json();
  }
};
