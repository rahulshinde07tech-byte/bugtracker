import React from 'react';

export default function BugCard({
  bug,
  onClick,
  onStatusChange,
  showAppName = false
}) {
  const getSeverityBadgeClass = (sev) => {
    switch (sev?.toLowerCase()) {
      case 'critical': return 'badge-critical';
      case 'high': return 'badge-high';
      case 'medium': return 'badge-medium';
      case 'low': return 'badge-low';
      default: return 'badge-medium';
    }
  };

  const nextStatuses = [
    { label: 'Open', value: 'Open' },
    { label: 'In Progress', value: 'In Progress' },
    { label: 'Resolved', value: 'Resolved' },
    { label: 'Closed', value: 'Closed' }
  ].filter(s => s.value.toLowerCase() !== bug.status?.toLowerCase());

  return (
    <div className="bug-card" onClick={onClick}>
      <div className="bug-card-header">
        <span className="bug-id">{bug.id}</span>
        <span className={`badge ${getSeverityBadgeClass(bug.severity)}`}>
          {bug.severity}
        </span>
      </div>

      <div className="bug-title">{bug.title}</div>

      {showAppName && bug.appName && (
        <div style={{ marginBottom: '8px' }}>
          <span
            style={{
              fontSize: '11px',
              padding: '2px 8px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(99, 102, 241, 0.1)',
              color: '#818cf8',
              fontWeight: 600
            }}
          >
            {bug.appName}
          </span>
        </div>
      )}

      {bug.deviceInfo && (
        <div
          style={{
            fontSize: '11px',
            color: 'var(--text-muted)',
            marginBottom: '8px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
          title={bug.deviceInfo}
        >
          📱 {bug.deviceInfo}
        </div>
      )}

      <div className="bug-meta-row">
        <div className="bug-assignee" title={`Assigned to ${bug.assignee || 'Unassigned'}`}>
          <span>👤</span> {bug.assignee || 'Unassigned'}
        </div>
        <span style={{ fontSize: '11px' }}>
          {new Date(bug.createdAt || Date.now()).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric'
          })}
        </span>
      </div>

      {/* Quick Move Chips for Mobile / Fast Triage */}
      <div className="quick-move-chips" onClick={(e) => e.stopPropagation()}>
        {nextStatuses.slice(0, 2).map(st => (
          <button
            key={st.value}
            className="move-chip"
            onClick={() => onStatusChange(bug.id, st.value)}
            title={`Move to ${st.label}`}
          >
            ➔ {st.label}
          </button>
        ))}
      </div>
    </div>
  );
}
