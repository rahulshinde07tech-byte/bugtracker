import React from 'react';

export default function AppHub({
  apps,
  bugs,
  activeApp,
  onSelectApp,
  onOpenAddApp,
  onOpenNewBugForApp
}) {
  // Helper to compute health metrics per app
  const getAppStats = (appId) => {
    const appBugs = appId === 'all' ? bugs : bugs.filter(b => b.appId === appId);
    const critical = appBugs.filter(b => b.severity?.toLowerCase() === 'critical' && b.status?.toLowerCase() !== 'closed' && b.status?.toLowerCase() !== 'resolved').length;
    const open = appBugs.filter(b => b.status?.toLowerCase() === 'open' || b.status?.toLowerCase() === 'in progress').length;
    const resolved = appBugs.filter(b => b.status?.toLowerCase() === 'resolved' || b.status?.toLowerCase() === 'closed').length;
    return { total: appBugs.length, critical, open, resolved };
  };

  const allStats = getAppStats('all');

  return (
    <div className="app-hub">
      <div className="app-hub-header">
        <div className="app-hub-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-medium" style={{ fontSize: '10px' }}>STEP 1</span>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Workspace Selector</span>
          </div>
          <h1>Select Application or Website</h1>
          <p>Choose an application to inspect its bugs, track progress on the board, or log new issues.</p>
        </div>

        <button className="btn btn-primary" onClick={onOpenAddApp}>
          <span>+</span> Add Application
        </button>
      </div>

      <div className="apps-grid">
        {/* Global Cross-App Overview Card */}
        <div
          className={`glass-card app-card ${activeApp === 'all' ? 'active' : ''}`}
          style={{ '--app-color': 'var(--accent-gradient)' }}
          onClick={() => onSelectApp('all')}
        >
          <div>
            <div className="app-card-top">
              <div className="app-icon-wrap" style={{ background: 'rgba(99, 102, 241, 0.2)' }}>
                🌐
              </div>
              <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8' }}>
                Cross-App Overview
              </span>
            </div>

            <div className="app-card-info">
              <h3>All Applications (Global)</h3>
              <span className="app-url">{apps.length} Applications Monitored</span>
              <p className="app-desc">
                Combined view across all registered websites, portals, and mobile web apps.
              </p>
            </div>
          </div>

          <div>
            <div className="app-health-metrics">
              <div className="health-pill crit">
                <strong>{allStats.critical}</strong>
                <span>Critical</span>
              </div>
              <div className="health-pill open">
                <strong>{allStats.open}</strong>
                <span>Active</span>
              </div>
              <div className="health-pill res">
                <strong>{allStats.resolved}</strong>
                <span>Resolved</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <button
                className="btn btn-secondary"
                style={{ flex: 1, fontSize: '12px', minHeight: '34px' }}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectApp('all');
                }}
              >
                Open Global Board ➔
              </button>
            </div>
          </div>
        </div>

        {/* Individual Application Cards */}
        {apps.map(app => {
          const stats = getAppStats(app.id);
          const isSelected = activeApp === app.id;

          return (
            <div
              key={app.id}
              className={`glass-card app-card ${isSelected ? 'active' : ''}`}
              style={{ '--app-color': app.color || '#6366f1' }}
              onClick={() => onSelectApp(app.id)}
            >
              <div>
                <div className="app-card-top">
                  <div className="app-icon-wrap">
                    {app.icon || '🚀'}
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <span
                      className="badge"
                      style={{
                        background: app.environment === 'Production' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                        color: app.environment === 'Production' ? '#10b981' : '#f59e0b'
                      }}
                    >
                      {app.environment}
                    </span>
                  </div>
                </div>

                <div className="app-card-info">
                  <h3>{app.name}</h3>
                  {app.url && (
                    <a
                      href={app.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="app-url"
                      onClick={(e) => e.stopPropagation()}
                    >
                      🔗 {app.url.replace(/^https?:\/\//, '')}
                    </a>
                  )}
                  <p className="app-desc">{app.description || 'No description provided.'}</p>
                </div>
              </div>

              <div>
                <div className="app-health-metrics">
                  <div className="health-pill crit">
                    <strong>{stats.critical}</strong>
                    <span>Critical</span>
                  </div>
                  <div className="health-pill open">
                    <strong>{stats.open}</strong>
                    <span>Active</span>
                  </div>
                  <div className="health-pill res">
                    <strong>{stats.resolved}</strong>
                    <span>Resolved</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <button
                    className="btn btn-secondary"
                    style={{ flex: 1, fontSize: '12px', minHeight: '34px' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectApp(app.id);
                    }}
                  >
                    Open Board ➔
                  </button>
                  <button
                    className="btn btn-ghost"
                    style={{ fontSize: '12px', minHeight: '34px', padding: '0 10px' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenNewBugForApp(app.id);
                    }}
                    title="Report bug for this application"
                  >
                    + Bug
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {/* Add Application Card */}
        <div className="glass-card add-app-card" onClick={onOpenAddApp}>
          <div className="add-app-icon">+</div>
          <h3 style={{ fontSize: '16px', marginBottom: '4px' }}>Register New Website</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Add an application, portal, or website to track bugs for your team.
          </p>
        </div>
      </div>
    </div>
  );
}
