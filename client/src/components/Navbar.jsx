import React, { useState } from 'react';

export default function Navbar({
  apps,
  activeApp,
  onSelectApp,
  sheetStatus,
  onSync,
  isSyncing,
  theme,
  onToggleTheme,
  onOpenSettings,
  onOpenNewBug,
  activeUser,
  team,
  onSelectUser
}) {
  const [appDropdownOpen, setAppDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const selectedAppObj = apps.find(a => a.id === activeApp);

  return (
    <header className="navbar">
      <div className="nav-brand" onClick={() => onSelectApp('all')}>
        <span className="brand-icon">🐞</span>
        <span className="brand-text">BugTracker Pro</span>
      </div>

      <div className="nav-center">
        {/* Step 1: Active App Switcher Pill */}
        <div style={{ position: 'relative' }}>
          <button
            className="active-app-pill"
            onClick={() => setAppDropdownOpen(!appDropdownOpen)}
            title="Switch Application"
          >
            <span>{selectedAppObj?.icon || '🌐'}</span>
            <span>{selectedAppObj?.name || 'All Applications'}</span>
            <span style={{ fontSize: '10px', opacity: 0.7 }}>▼</span>
          </button>

          {appDropdownOpen && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                marginTop: '8px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                minWidth: '240px',
                zIndex: 60,
                padding: '6px'
              }}
            >
              <div
                style={{
                  padding: '8px 12px',
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: 'var(--text-muted)'
                }}
              >
                Switch Project / App
              </div>
              <div
                onClick={() => {
                  onSelectApp('all');
                  setAppDropdownOpen(false);
                }}
                style={{
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: activeApp === 'all' ? 700 : 500,
                  color: activeApp === 'all' ? 'var(--accent-primary)' : 'var(--text-primary)',
                  background: activeApp === 'all' ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span>🌐</span> All Applications (Overview)
              </div>
              {apps.map(app => (
                <div
                  key={app.id}
                  onClick={() => {
                    onSelectApp(app.id);
                    setAppDropdownOpen(false);
                  }}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: activeApp === app.id ? 700 : 500,
                    color: activeApp === app.id ? 'var(--accent-primary)' : 'var(--text-primary)',
                    background: activeApp === app.id ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span>{app.icon || '📱'}</span> {app.name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="nav-actions">
        {/* Google Sheets Sync Pill */}
        <div
          className="status-indicator"
          onClick={onSync}
          style={{ cursor: 'pointer' }}
          title={sheetStatus?.connected ? 'Connected to Google Sheets. Click to sync.' : 'Demo Mode (Local storage). Click to sync.'}
        >
          <span className={`status-dot ${sheetStatus?.connected ? 'connected' : 'demo'}`} />
          <span style={{ display: 'none', md: 'inline' }}>
            {isSyncing ? 'Syncing...' : sheetStatus?.connected ? 'Google Sheets' : 'Demo Mode'}
          </span>
          <span style={{ fontSize: '11px', opacity: 0.7 }}>⟳</span>
        </div>

        {/* User Identity Selector */}
        <div style={{ position: 'relative' }}>
          <button
            className="btn btn-secondary btn-icon"
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            title={`Active User: ${activeUser?.name || 'Rahul'}`}
            style={{ fontSize: '16px' }}
          >
            {activeUser?.avatar || '👨‍💻'}
          </button>

          {userDropdownOpen && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '8px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                minWidth: '200px',
                zIndex: 60,
                padding: '6px'
              }}
            >
              <div style={{ padding: '8px 12px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                You are working as:
              </div>
              {team.map(member => (
                <div
                  key={member.id}
                  onClick={() => {
                    onSelectUser(member);
                    setUserDropdownOpen(false);
                  }}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: activeUser?.id === member.id ? 700 : 500,
                    color: activeUser?.id === member.id ? 'var(--accent-primary)' : 'var(--text-primary)',
                    background: activeUser?.id === member.id ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span>{member.avatar}</span>
                  <div>
                    <div>{member.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{member.role}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          className="btn btn-ghost btn-icon"
          onClick={onToggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        {/* Settings */}
        <button
          className="btn btn-ghost btn-icon"
          onClick={onOpenSettings}
          title="Google Sheets & App Settings"
        >
          ⚙️
        </button>

        {/* Desktop Quick Report Button */}
        <button
          className="btn btn-primary"
          onClick={onOpenNewBug}
          style={{ display: 'none', lg: 'inline-flex' }}
        >
          <span>+</span> Report Bug
        </button>
      </div>
    </header>
  );
}
