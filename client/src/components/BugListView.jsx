import React, { useState } from 'react';

export default function BugListView({
  bugs,
  apps,
  activeApp,
  onSelectBug,
  onOpenNewBug,
  activeUser,
  onDeleteBug
}) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [assignedToMeOnly, setAssignedToMeOnly] = useState(false);

  const filteredBugs = bugs.filter(bug => {
    if (activeApp !== 'all' && bug.appId !== activeApp) return false;
    if (statusFilter !== 'all' && bug.status?.toLowerCase() !== statusFilter.toLowerCase()) return false;
    if (severityFilter !== 'all' && bug.severity?.toLowerCase() !== severityFilter.toLowerCase()) return false;
    if (assignedToMeOnly && activeUser?.name) {
      if (bug.assignee?.toLowerCase() !== activeUser.name.toLowerCase()) return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        bug.title?.toLowerCase().includes(q) ||
        bug.id?.toLowerCase().includes(q) ||
        bug.description?.toLowerCase().includes(q) ||
        bug.assignee?.toLowerCase().includes(q) ||
        bug.url?.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const getSeverityBadge = (sev) => {
    switch (sev?.toLowerCase()) {
      case 'critical': return <span className="badge badge-critical">Critical</span>;
      case 'high': return <span className="badge badge-high">High</span>;
      case 'medium': return <span className="badge badge-medium">Medium</span>;
      case 'low': return <span className="badge badge-low">Low</span>;
      default: return <span className="badge badge-medium">{sev}</span>;
    }
  };

  const getStatusBadge = (st) => {
    const key = st?.toLowerCase().replace(/\s+/g, '') || 'open';
    return <span className={`badge badge-status ${key}`}>{st}</span>;
  };

  return (
    <div className="bug-list-view">
      <div className="toolbar">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="form-input search-input"
            placeholder="Search bugs by title, ID, URL, assignee..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="in progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>

          <select
            className="form-select"
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
          >
            <option value="all">All Severities</option>
            <option value="critical">🔴 Critical</option>
            <option value="high">🟠 High</option>
            <option value="medium">🟡 Medium</option>
            <option value="low">🟢 Low</option>
          </select>

          <button
            className={`btn ${assignedToMeOnly ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setAssignedToMeOnly(!assignedToMeOnly)}
          >
            👤 Assigned to Me
          </button>

          <button className="btn btn-primary" onClick={onOpenNewBug}>
            <span>+</span> Report Bug
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '100px' }}>ID</th>
              <th>Bug Title</th>
              {activeApp === 'all' && <th>Application</th>}
              <th>Severity</th>
              <th>Status</th>
              <th>Environment</th>
              <th>Assignee</th>
              <th>Reported</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBugs.length === 0 ? (
              <tr>
                <td colSpan={activeApp === 'all' ? 9 : 8} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  No matching bugs found.
                </td>
              </tr>
            ) : (
              filteredBugs.map(bug => (
                <tr key={bug.id} onClick={() => onSelectBug(bug)} style={{ cursor: 'pointer' }}>
                  <td>
                    <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--text-muted)' }}>
                      {bug.id}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '3px' }}>
                      {bug.title}
                    </div>
                    {bug.url && (
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        📍 {bug.url}
                      </div>
                    )}
                  </td>
                  {activeApp === 'all' && (
                    <td>
                      <span style={{ fontSize: '12px', color: '#818cf8', fontWeight: 600 }}>
                        {bug.appName}
                      </span>
                    </td>
                  )}
                  <td>{getSeverityBadge(bug.severity)}</td>
                  <td>{getStatusBadge(bug.status)}</td>
                  <td>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {bug.environment}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                      <span>👤</span> {bug.assignee || 'Unassigned'}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {new Date(bug.createdAt || Date.now()).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="btn btn-ghost btn-icon"
                      style={{ width: '32px', height: '32px', fontSize: '14px' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Delete ${bug.id}: ${bug.title}?`)) {
                          onDeleteBug(bug.id);
                        }
                      }}
                      title="Delete Bug"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
