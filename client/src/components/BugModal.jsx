import React, { useState, useEffect } from 'react';
import { getDeviceInfo } from '../utils/deviceDetector';

export default function BugModal({
  isOpen,
  onClose,
  onSave,
  bugToEdit,
  apps,
  activeApp,
  team,
  activeUser
}) {
  const isEditing = Boolean(bugToEdit);

  const [title, setTitle] = useState('');
  const [appId, setAppId] = useState(activeApp !== 'all' ? activeApp : (apps[0]?.id || ''));
  const [severity, setSeverity] = useState('Medium');
  const [status, setStatus] = useState('Open');
  const [category, setCategory] = useState('Functional');
  const [environment, setEnvironment] = useState('Production');
  const [deviceInfo, setDeviceInfo] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [reporter, setReporter] = useState(activeUser?.name || 'Rahul');
  const [assignee, setAssignee] = useState('Dev Team');

  useEffect(() => {
    if (bugToEdit) {
      setTitle(bugToEdit.title || '');
      setAppId(bugToEdit.appId || apps[0]?.id || '');
      setSeverity(bugToEdit.severity || 'Medium');
      setStatus(bugToEdit.status || 'Open');
      setCategory(bugToEdit.category || 'Functional');
      setEnvironment(bugToEdit.environment || 'Production');
      setDeviceInfo(bugToEdit.deviceInfo || '');
      setUrl(bugToEdit.url || '');
      setDescription(bugToEdit.description || '');
      setScreenshotUrl(bugToEdit.screenshotUrl || '');
      setReporter(bugToEdit.reporter || activeUser?.name || 'Rahul');
      setAssignee(bugToEdit.assignee || 'Dev Team');
    } else {
      // New bug: auto-populate current device information!
      setTitle('');
      setAppId(activeApp !== 'all' ? activeApp : (apps[0]?.id || ''));
      setSeverity('Medium');
      setStatus('Open');
      setCategory('Functional');
      setEnvironment('Production');
      setDeviceInfo(getDeviceInfo());
      setUrl('');
      setDescription('');
      setScreenshotUrl('');
      setReporter(activeUser?.name || 'Rahul');
      setAssignee('Dev Team');
    }
  }, [bugToEdit, isOpen, activeApp, apps, activeUser]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return alert('Please enter a bug title');
    if (!appId) return alert('Please select an application');

    const appObj = apps.find(a => a.id === appId);

    const bugData = {
      title: title.trim(),
      appId,
      appName: appObj?.name || 'Application',
      severity,
      status,
      category,
      environment,
      deviceInfo,
      url: url.trim(),
      description: description.trim(),
      screenshotUrl: screenshotUrl.trim(),
      reporter: reporter.trim(),
      assignee: assignee.trim()
    };

    onSave(bugData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>{isEditing ? '✏️' : '🐞'}</span>
            <h2 style={{ fontSize: '18px' }}>
              {isEditing ? `Edit Bug ${bugToEdit.id}` : 'Report New Bug'}
            </h2>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          <div className="modal-body">
            {/* Step 1 pre-selection indicator */}
            <div className="form-group">
              <label className="form-label">Application / Website *</label>
              <select
                className="form-select"
                value={appId}
                onChange={(e) => setAppId(e.target.value)}
                required
              >
                {apps.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.icon} {a.name} ({a.environment})
                  </option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div className="form-group">
              <label className="form-label">Bug Summary / Title *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., Checkout payment button unresponsive on iOS Safari"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                autoFocus
              />
            </div>

            {/* Severity Pill Selector */}
            <div className="form-group">
              <label className="form-label">Severity Level</label>
              <div className="severity-pill-selector">
                {['Critical', 'High', 'Medium', 'Low'].map(sev => (
                  <div
                    key={sev}
                    className={`severity-option ${sev.toLowerCase()} ${severity === sev ? 'active' : ''}`}
                    onClick={() => setSeverity(sev)}
                  >
                    {sev === 'Critical' && '🔴 '}
                    {sev === 'High' && '🟠 '}
                    {sev === 'Medium' && '🟡 '}
                    {sev === 'Low' && '🟢 '}
                    {sev}
                  </div>
                ))}
              </div>
            </div>

            {/* If Editing: Status Selector */}
            {isEditing && (
              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            )}

            {/* Category & Environment */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="Functional">Functional Issue</option>
                  <option value="UI/Visual">UI / Visual Glitch</option>
                  <option value="Performance">Performance / Slow</option>
                  <option value="Security">Security / Auth</option>
                  <option value="Content">Content / Copy</option>
                </select>
              </div>

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
            </div>

            {/* Page URL & Device info */}
            <div className="form-group">
              <label className="form-label">Page URL / Path</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., /checkout or https://shop.example.com/item"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label">Detected Device & Browser</label>
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: '11px', cursor: 'pointer' }}
                  onClick={() => setDeviceInfo(getDeviceInfo())}
                >
                  Auto-Detect Again
                </button>
              </div>
              <input
                type="text"
                className="form-input"
                value={deviceInfo}
                onChange={(e) => setDeviceInfo(e.target.value)}
              />
            </div>

            {/* Description / Steps */}
            <div className="form-group">
              <label className="form-label">Description & Steps to Reproduce</label>
              <textarea
                className="form-textarea"
                placeholder="1. Open product page&#10;2. Click add to cart&#10;3. Notice error message..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Screenshot URL */}
            <div className="form-group">
              <label className="form-label">Screenshot / Attachment URL</label>
              <input
                type="url"
                className="form-input"
                placeholder="https://... (Google Drive, Cloudinary, Imgur, etc.)"
                value={screenshotUrl}
                onChange={(e) => setScreenshotUrl(e.target.value)}
              />
            </div>

            {/* Reporter & Assignee (Team) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Reporter</label>
                <input
                  type="text"
                  className="form-input"
                  value={reporter}
                  onChange={(e) => setReporter(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Assignee</label>
                <select
                  className="form-select"
                  value={assignee}
                  onChange={(e) => setAssignee(e.target.value)}
                >
                  {team.map(m => (
                    <option key={m.id} value={m.name}>
                      {m.avatar} {m.name} ({m.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {isEditing ? 'Save Changes' : 'Submit Bug'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
