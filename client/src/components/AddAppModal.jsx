import React, { useState } from 'react';

const ICONS = ['🚀', '🛒', '🌐', '📱', '👤', '📦', '💳', '⚙️', '📊', '🛡️'];
const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#3b82f6', '#8b5cf6', '#ef4444', '#14b8a6'];

export default function AddAppModal({ isOpen, onClose, onSave }) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [environment, setEnvironment] = useState('Production');
  const [platform, setPlatform] = useState('Web / Mobile Web');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('🚀');
  const [color, setColor] = useState('#6366f1');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return alert('Please enter application name');

    onSave({
      name: name.trim(),
      url: url.trim(),
      environment,
      platform,
      description: description.trim(),
      icon,
      color
    });

    setName('');
    setUrl('');
    setDescription('');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>🚀</span>
            <h2 style={{ fontSize: '18px' }}>Register New Application or Website</h2>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Application Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., Customer Support Portal"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label">Website / Web App URL</label>
              <input
                type="url"
                className="form-input"
                placeholder="https://app.example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Environment</label>
                <select
                  className="form-select"
                  value={environment}
                  onChange={(e) => setEnvironment(e.target.value)}
                >
                  <option value="Production">Production</option>
                  <option value="Staging">Staging</option>
                  <option value="Development">Development</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Platform</label>
                <select
                  className="form-select"
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                >
                  <option value="Web / Mobile Web">Web / Mobile Web</option>
                  <option value="Single Page App">Single Page App (SPA)</option>
                  <option value="Mobile Web PWA">Mobile Web PWA</option>
                  <option value="Landing Page">Landing Page</option>
                </select>
              </div>
            </div>

            {/* Icon Picker */}
            <div className="form-group">
              <label className="form-label">Choose App Icon</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {ICONS.map(ic => (
                  <button
                    key={ic}
                    type="button"
                    style={{
                      width: '40px',
                      height: '40px',
                      fontSize: '20px',
                      borderRadius: 'var(--radius-md)',
                      border: icon === ic ? '2px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                      background: icon === ic ? 'rgba(99, 102, 241, 0.2)' : 'var(--bg-elevated)',
                      cursor: 'pointer'
                    }}
                    onClick={() => setIcon(ic)}
                  >
                    {ic}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Accent */}
            <div className="form-group">
              <label className="form-label">Theme Accent Color</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: c,
                      border: color === c ? '3px solid #ffffff' : 'none',
                      boxShadow: color === c ? `0 0 10px ${c}` : 'none',
                      cursor: 'pointer'
                    }}
                    onClick={() => setColor(c)}
                  />
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-textarea"
                placeholder="Brief summary of what this application or website does..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Register Application
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
