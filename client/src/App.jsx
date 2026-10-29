import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import AppHub from './components/AppHub';
import KanbanBoard from './components/KanbanBoard';
import BugListView from './components/BugListView';
import AnalyticsView from './components/AnalyticsView';
import BugModal from './components/BugModal';
import AddAppModal from './components/AddAppModal';
import SettingsModal from './components/SettingsModal';
import { api } from './utils/api';

export default function App() {
  const [apps, setApps] = useState([]);
  const [bugs, setBugs] = useState([]);
  const [team, setTeam] = useState([]);
  const [activeApp, setActiveApp] = useState('all');
  const [activeTab, setActiveTab] = useState('apps'); // 'apps', 'kanban', 'list', 'analytics'
  const [theme, setTheme] = useState('dark');
  const [sheetStatus, setSheetStatus] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [toast, setToast] = useState(null);

  // Active User Identity (managed in React state, loaded from Google Sheet team)
  const [activeUser, setActiveUser] = useState({
    id: 'team-1',
    name: 'Rahul',
    role: 'Fullstack Lead',
    avatar: '👨‍💻'
  });

  // Modal States
  const [isBugModalOpen, setIsBugModalOpen] = useState(false);
  const [bugToEdit, setBugToEdit] = useState(null);
  const [isAddAppModalOpen, setIsAddAppModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Apply theme to document (in-memory state, zero localStorage)
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const handleSelectUser = (user) => {
    setActiveUser(user);
    showToast(`Working as ${user.name}`);
  };

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  // Load initial data directly from Google Sheets via backend
  const loadData = async () => {
    try {
      const healthRes = await api.getHealth();
      if (healthRes.googleSheets) {
        setSheetStatus(healthRes.googleSheets);
      }

      if (healthRes.googleSheets?.connected) {
        const [appsRes, bugsRes, teamRes] = await Promise.all([
          api.getApps(),
          api.getBugs(),
          api.getTeam()
        ]);

        if (appsRes.data) setApps(appsRes.data);
        if (bugsRes.data) setBugs(bugsRes.data);
        if (teamRes.data && teamRes.data.length > 0) {
          setTeam(teamRes.data);
          setActiveUser(teamRes.data[0]);
        }
      } else {
        setApps([]);
        setBugs([]);
      }
    } catch (err) {
      console.error('Error fetching data from Google Sheets API:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Sync directly from Google Sheets
  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const res = await api.syncSheets();
      await loadData();
      showToast(res.message || 'Synced with Google Sheets!');
    } catch (err) {
      showToast('Sync completed');
    } finally {
      setIsSyncing(false);
    }
  };

  // Select Application (Step 1)
  const handleSelectApp = (appId) => {
    setActiveApp(appId);
    if (activeTab === 'apps') {
      setActiveTab('kanban');
    }
  };

  // Create or Update Bug (Directly to Google Sheets)
  const handleSaveBug = async (bugData) => {
    try {
      if (bugToEdit) {
        const res = await api.updateBug(bugToEdit.id, bugData);
        if (res.success) {
          setBugs(prev => prev.map(b => (b.id === bugToEdit.id ? res.data : b)));
          showToast(`Updated ${bugToEdit.id} in Google Sheets`);
        } else {
          alert(res.error || 'Failed to update bug');
        }
      } else {
        const res = await api.createBug(bugData);
        if (res.success) {
          setBugs(prev => [res.data, ...prev]);
          showToast(`Reported ${res.data.id} to Google Sheets`);
        } else {
          alert(res.error || 'Failed to create bug');
        }
      }
      setIsBugModalOpen(false);
      setBugToEdit(null);
    } catch (err) {
      alert('Error saving to Google Sheets: ' + err.message);
    }
  };

  // Quick Status Shift (Directly in Google Sheets)
  const handleUpdateBugStatus = async (id, newStatus) => {
    try {
      setBugs(prev => prev.map(b => (b.id === id ? { ...b, status: newStatus } : b)));
      const res = await api.updateBug(id, { status: newStatus });
      if (res.success) {
        showToast(`Moved ${id} to ${newStatus} in Google Sheets`);
      }
    } catch (err) {
      console.error('Failed to update status in Google Sheets:', err);
      loadData();
    }
  };

  // Delete Bug (Directly in Google Sheets)
  const handleDeleteBug = async (id) => {
    try {
      setBugs(prev => prev.filter(b => b.id !== id));
      const res = await api.deleteBug(id);
      if (res.success) {
        showToast(`Deleted ${id} from Google Sheets`);
      }
    } catch (err) {
      console.error('Failed to delete bug from Google Sheets:', err);
      loadData();
    }
  };

  // Create Application (Directly in Google Sheets Apps tab)
  const handleCreateApp = async (appData) => {
    try {
      const res = await api.createApp(appData);
      if (res.success) {
        setApps(prev => [...prev, res.data]);
        setActiveApp(res.data.id);
        setIsAddAppModalOpen(false);
        showToast(`Registered ${res.data.name} in Google Sheets`);
      } else {
        alert(res.error || 'Failed to create application');
      }
    } catch (err) {
      alert('Error creating application in Google Sheets: ' + err.message);
    }
  };

  const handleOpenNewBugForApp = (appId) => {
    setActiveApp(appId);
    setBugToEdit(null);
    setIsBugModalOpen(true);
  };

  const selectedAppObj = apps.find(a => a.id === activeApp);

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <Navbar
        apps={apps}
        activeApp={activeApp}
        onSelectApp={handleSelectApp}
        sheetStatus={sheetStatus}
        onSync={handleSync}
        isSyncing={isSyncing}
        theme={theme}
        onToggleTheme={() => setTheme(t => (t === 'dark' ? 'light' : 'dark'))}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenNewBug={() => {
          setBugToEdit(null);
          setIsBugModalOpen(true);
        }}
        activeUser={activeUser}
        team={team}
        onSelectUser={handleSelectUser}
      />

      {/* Main Content Area */}
      <main className="main-content">
        {/* If Google Sheets is not connected, show mandatory connection setup banner */}
        {sheetStatus && !sheetStatus.connected && (
          <div
            className="glass-card"
            style={{
              marginBottom: '24px',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              background: 'rgba(245, 158, 11, 0.08)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '20px' }}>⚠️</span>
                  <h2 style={{ fontSize: '18px', color: '#fbbf24' }}>Google Sheets Connection Required</h2>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  This app uses <strong>Google Sheets exclusively</strong> as its database (localStorage is disabled).
                  Please add your <code>GOOGLE_SHEET_ID</code> and Service Account in <code>server/.env</code>.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-primary" onClick={() => setIsSettingsModalOpen(true)}>
                  ⚙️ View Setup Guide
                </button>
                <button className="btn btn-secondary" onClick={handleSync} disabled={isSyncing}>
                  {isSyncing ? 'Connecting...' : '⟳ Retry Connection'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Desktop View Switcher Tabs */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px',
            borderBottom: '1px solid var(--border-subtle)',
            paddingBottom: '12px',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className={`btn ${activeTab === 'apps' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setActiveTab('apps')}
            >
              📱 Step 1: Apps Hub
            </button>
            <button
              className={`btn ${activeTab === 'kanban' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setActiveTab('kanban')}
            >
              📋 Kanban Board
            </button>
            <button
              className={`btn ${activeTab === 'list' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setActiveTab('list')}
            >
              📑 Bug List
            </button>
            <button
              className={`btn ${activeTab === 'analytics' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setActiveTab('analytics')}
            >
              📊 Analytics
            </button>
          </div>

          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Viewing: <strong style={{ color: 'var(--text-primary)' }}>{selectedAppObj?.name || 'All Applications'}</strong>
          </div>
        </div>

        {/* View Routing */}
        {activeTab === 'apps' && (
          <AppHub
            apps={apps}
            bugs={bugs}
            activeApp={activeApp}
            onSelectApp={handleSelectApp}
            onOpenAddApp={() => setIsAddAppModalOpen(true)}
            onOpenNewBugForApp={handleOpenNewBugForApp}
          />
        )}

        {activeTab === 'kanban' && (
          <KanbanBoard
            bugs={bugs}
            activeApp={activeApp}
            apps={apps}
            onSelectBug={(bug) => {
              setBugToEdit(bug);
              setIsBugModalOpen(true);
            }}
            onUpdateBugStatus={handleUpdateBugStatus}
            onOpenNewBug={() => {
              setBugToEdit(null);
              setIsBugModalOpen(true);
            }}
            activeUser={activeUser}
          />
        )}

        {activeTab === 'list' && (
          <BugListView
            bugs={bugs}
            apps={apps}
            activeApp={activeApp}
            onSelectBug={(bug) => {
              setBugToEdit(bug);
              setIsBugModalOpen(true);
            }}
            onOpenNewBug={() => {
              setBugToEdit(null);
              setIsBugModalOpen(true);
            }}
            activeUser={activeUser}
            onDeleteBug={handleDeleteBug}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView bugs={bugs} apps={apps} />
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenNewBug={() => {
          setBugToEdit(null);
          setIsBugModalOpen(true);
        }}
      />

      {/* Modals */}
      <BugModal
        isOpen={isBugModalOpen}
        onClose={() => {
          setIsBugModalOpen(false);
          setBugToEdit(null);
        }}
        onSave={handleSaveBug}
        bugToEdit={bugToEdit}
        apps={apps}
        activeApp={activeApp}
        team={team}
        activeUser={activeUser}
      />

      <AddAppModal
        isOpen={isAddAppModalOpen}
        onClose={() => setIsAddAppModalOpen(false)}
        onSave={handleCreateApp}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        sheetStatus={sheetStatus}
        onSync={handleSync}
        isSyncing={isSyncing}
      />

      {/* Toast Notification */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: '80px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--accent-primary)',
            color: 'var(--text-primary)',
            padding: '10px 18px',
            borderRadius: 'var(--radius-full)',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 999,
            fontSize: '13px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            animation: 'fadeIn 0.2s ease'
          }}
        >
          <span>✓</span> {toast}
        </div>
      )}
    </div>
  );
}
