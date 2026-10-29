import React from 'react';

export default function BottomNav({ activeTab, onSelectTab, onOpenNewBug }) {
  return (
    <nav className="bottom-nav">
      <button
        className={`bottom-nav-item ${activeTab === 'apps' ? 'active' : ''}`}
        onClick={() => onSelectTab('apps')}
      >
        <span style={{ fontSize: '20px' }}>📱</span>
        <span>Apps</span>
      </button>

      <button
        className={`bottom-nav-item ${activeTab === 'kanban' ? 'active' : ''}`}
        onClick={() => onSelectTab('kanban')}
      >
        <span style={{ fontSize: '20px' }}>📋</span>
        <span>Board</span>
      </button>

      <button
        className="bottom-nav-item add-btn"
        onClick={onOpenNewBug}
        title="Report New Bug"
      >
        +
      </button>

      <button
        className={`bottom-nav-item ${activeTab === 'list' ? 'active' : ''}`}
        onClick={() => onSelectTab('list')}
      >
        <span style={{ fontSize: '20px' }}>📑</span>
        <span>List</span>
      </button>

      <button
        className={`bottom-nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
        onClick={() => onSelectTab('analytics')}
      >
        <span style={{ fontSize: '20px' }}>📊</span>
        <span>Stats</span>
      </button>
    </nav>
  );
}
