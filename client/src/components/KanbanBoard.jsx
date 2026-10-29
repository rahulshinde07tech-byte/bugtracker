import React, { useState } from 'react';
import BugCard from './BugCard';

const COLUMNS = [
  { id: 'Open', label: 'Open', color: 'var(--status-open)' },
  { id: 'In Progress', label: 'In Progress', color: 'var(--status-inprogress)' },
  { id: 'Resolved', label: 'Resolved', color: 'var(--status-resolved)' },
  { id: 'Closed', label: 'Closed', color: 'var(--status-closed)' }
];

export default function KanbanBoard({
  bugs,
  activeApp,
  apps,
  onSelectBug,
  onUpdateBugStatus,
  onOpenNewBug,
  activeUser
}) {
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [assignedToMeOnly, setAssignedToMeOnly] = useState(false);
  const [draggedBugId, setDraggedBugId] = useState(null);

  const selectedAppObj = apps.find(a => a.id === activeApp);

  // Filter bugs
  const filteredBugs = bugs.filter(bug => {
    // App filter
    if (activeApp !== 'all' && bug.appId !== activeApp) return false;

    // Severity filter
    if (severityFilter !== 'all' && bug.severity?.toLowerCase() !== severityFilter.toLowerCase()) return false;

    // Assigned to me filter
    if (assignedToMeOnly && activeUser?.name) {
      if (bug.assignee?.toLowerCase() !== activeUser.name.toLowerCase()) return false;
    }

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        bug.title?.toLowerCase().includes(q) ||
        bug.id?.toLowerCase().includes(q) ||
        bug.description?.toLowerCase().includes(q) ||
        bug.assignee?.toLowerCase().includes(q) ||
        bug.appName?.toLowerCase().includes(q);
      if (!match) return false;
    }

    return true;
  });

  // Drag handlers
  const handleDragStart = (e, bugId) => {
    setDraggedBugId(bugId);
    e.dataTransfer.setData('text/plain', bugId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetStatus) => {
    e.preventDefault();
    const bugId = e.dataTransfer.getData('text/plain') || draggedBugId;
    if (bugId) {
      onUpdateBugStatus(bugId, targetStatus);
    }
    setDraggedBugId(null);
  };

  return (
    <div className="kanban-view">
      {/* Header & Controls Toolbar */}
      <div className="toolbar">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="form-input search-input"
            placeholder={`Search ${activeApp === 'all' ? 'all' : selectedAppObj?.name || ''} bugs...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-group">
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
            title={`Show only bugs assigned to ${activeUser?.name || 'me'}`}
          >
            👤 Assigned to Me
          </button>

          <button className="btn btn-primary" onClick={onOpenNewBug}>
            <span>+</span> Report Bug
          </button>
        </div>
      </div>

      {/* Kanban 4 Columns */}
      <div className="kanban-container">
        {COLUMNS.map(col => {
          const colBugs = filteredBugs.filter(
            b => b.status?.toLowerCase() === col.id.toLowerCase()
          );

          return (
            <div
              key={col.id}
              className="kanban-column"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              <div className="column-header">
                <div className="column-title">
                  <span
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: col.color,
                      boxShadow: `0 0 8px ${col.color}`
                    }}
                  />
                  <span>{col.label}</span>
                </div>
                <span className="column-count">{colBugs.length}</span>
              </div>

              <div className="column-cards">
                {colBugs.length === 0 ? (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '36px 12px',
                      color: 'var(--text-muted)',
                      fontSize: '13px',
                      border: '1px dashed var(--border-subtle)',
                      borderRadius: 'var(--radius-md)'
                    }}
                  >
                    No {col.label.toLowerCase()} bugs
                  </div>
                ) : (
                  colBugs.map(bug => (
                    <div
                      key={bug.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, bug.id)}
                    >
                      <BugCard
                        bug={bug}
                        onClick={() => onSelectBug(bug)}
                        onStatusChange={onUpdateBugStatus}
                        showAppName={activeApp === 'all'}
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
