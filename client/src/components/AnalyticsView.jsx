import React from 'react';

export default function AnalyticsView({ bugs, apps }) {
  const totalBugs = bugs.length;
  const criticalBugs = bugs.filter(b => b.severity?.toLowerCase() === 'critical' && b.status?.toLowerCase() !== 'closed' && b.status?.toLowerCase() !== 'resolved').length;
  const openBugs = bugs.filter(b => b.status?.toLowerCase() === 'open' || b.status?.toLowerCase() === 'in progress').length;
  const resolvedBugs = bugs.filter(b => b.status?.toLowerCase() === 'resolved' || b.status?.toLowerCase() === 'closed').length;
  const resolutionRate = totalBugs > 0 ? Math.round((resolvedBugs / totalBugs) * 100) : 0;

  // Severity counts
  const severities = {
    Critical: bugs.filter(b => b.severity?.toLowerCase() === 'critical').length,
    High: bugs.filter(b => b.severity?.toLowerCase() === 'high').length,
    Medium: bugs.filter(b => b.severity?.toLowerCase() === 'medium').length,
    Low: bugs.filter(b => b.severity?.toLowerCase() === 'low').length,
  };

  // Categories counts
  const categories = bugs.reduce((acc, b) => {
    const cat = b.category || 'Other';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  // Team workload counts
  const assignees = bugs.reduce((acc, b) => {
    const person = b.assignee || 'Unassigned';
    acc[person] = (acc[person] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="analytics-view">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '26px', marginBottom: '6px' }}>Quality & Health Analytics</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Real-time metrics on bug volume, critical blockers, and team resolution velocity.
        </p>
      </div>

      {/* Top 4 KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="glass-card">
          <div style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600 }}>Active Issues</div>
          <div style={{ fontSize: '32px', fontWeight: 800, marginTop: '4px', color: 'var(--status-open)' }}>{openBugs}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>Open or in progress</div>
        </div>

        <div className="glass-card">
          <div style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600 }}>Critical Blockers</div>
          <div style={{ fontSize: '32px', fontWeight: 800, marginTop: '4px', color: 'var(--severity-critical)' }}>{criticalBugs}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>Requires immediate triage</div>
        </div>

        <div className="glass-card">
          <div style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600 }}>Resolution Rate</div>
          <div style={{ fontSize: '32px', fontWeight: 800, marginTop: '4px', color: 'var(--status-resolved)' }}>{resolutionRate}%</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>{resolvedBugs} of {totalBugs} bugs resolved</div>
        </div>

        <div className="glass-card">
          <div style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600 }}>Applications Monitored</div>
          <div style={{ fontSize: '32px', fontWeight: 800, marginTop: '4px', color: 'var(--accent-primary)' }}>{apps.length}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>Connected web & mobile apps</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Bugs per Application */}
        <div className="glass-card">
          <h3 style={{ fontSize: '17px', marginBottom: '16px' }}>Bugs by Application</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {apps.map(app => {
              const count = bugs.filter(b => b.appId === app.id).length;
              const pct = totalBugs > 0 ? Math.round((count / totalBugs) * 100) : 0;
              return (
                <div key={app.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 600 }}>{app.icon} {app.name}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{count} ({pct}%)</span>
                  </div>
                  <div style={{ height: '8px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: app.color || 'var(--accent-primary)', borderRadius: 'var(--radius-full)' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Severity Distribution */}
        <div className="glass-card">
          <h3 style={{ fontSize: '17px', marginBottom: '16px' }}>Severity Breakdown</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {Object.entries(severities).map(([sev, count]) => {
              const pct = totalBugs > 0 ? Math.round((count / totalBugs) * 100) : 0;
              const colors = {
                Critical: 'var(--severity-critical)',
                High: 'var(--severity-high)',
                Medium: 'var(--severity-medium)',
                Low: 'var(--severity-low)',
              };
              return (
                <div key={sev}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 600 }}>{sev}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{count} ({pct}%)</span>
                  </div>
                  <div style={{ height: '8px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: colors[sev], borderRadius: 'var(--radius-full)' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Categories */}
        <div className="glass-card">
          <h3 style={{ fontSize: '17px', marginBottom: '16px' }}>Category Breakdown</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {Object.entries(categories).map(([cat, count]) => (
              <div
                key={cat}
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '13px'
                }}
              >
                <span>🏷️</span>
                <span style={{ fontWeight: 600 }}>{cat}</span>
                <span className="badge badge-medium" style={{ fontSize: '11px' }}>{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Team Workload */}
        <div className="glass-card">
          <h3 style={{ fontSize: '17px', marginBottom: '16px' }}>Team Workload</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {Object.entries(assignees).map(([person, count]) => (
              <div
                key={person}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  background: 'var(--bg-elevated)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '13px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                  <span>👤</span> {person}
                </div>
                <span className="badge badge-status open">{count} Assigned</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
