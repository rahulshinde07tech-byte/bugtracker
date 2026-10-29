import React from 'react';

export default function SettingsModal({
  isOpen,
  onClose,
  sheetStatus,
  onSync,
  isSyncing
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>⚙️</span>
            <h2 style={{ fontSize: '18px' }}>Google Sheets & App Settings</h2>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {/* Connection Status Box */}
          <div
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              background: sheetStatus?.connected ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
              border: `1px solid ${sheetStatus?.connected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className={`status-dot ${sheetStatus?.connected ? 'connected' : 'demo'}`} />
                <strong style={{ fontSize: '15px' }}>
                  {sheetStatus?.connected ? 'Connected to Google Sheets' : 'Running in Demo / Local Mode'}
                </strong>
              </div>
              <button
                className="btn btn-secondary"
                style={{ fontSize: '12px', minHeight: '32px', padding: '0 10px' }}
                onClick={onSync}
                disabled={isSyncing}
              >
                {isSyncing ? 'Syncing...' : '⟳ Sync Now'}
              </button>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              {sheetStatus?.connected
                ? `Syncing in real time with spreadsheet ID: ${sheetStatus.spreadsheetId}`
                : 'Your server is using in-memory local storage with sample data. To connect your live company Google Sheet, follow the 4 steps below.'}
            </p>
          </div>

          {/* Quick Setup Guide */}
          <div>
            <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>How to Link Your Live Google Sheet</h3>
            <ol style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: 'var(--text-secondary)' }}>
              <li>
                <strong>Create a Google Sheet:</strong> Go to <a href="https://sheets.new" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-primary)' }}>sheets.new</a> and copy the Spreadsheet ID from the URL.
              </li>
              <li>
                <strong>Create Service Account:</strong> In Google Cloud Console, enable <em>Google Sheets API</em>, create a free Service Account, and generate a JSON key.
              </li>
              <li>
                <strong>Share Sheet:</strong> Click <em>Share</em> in Google Sheets and paste your Service Account email with <strong>Editor</strong> permission.
              </li>
              <li>
                <strong>Paste in <code>server/.env</code>:</strong> Set <code>GOOGLE_SHEET_ID</code>, <code>GOOGLE_SERVICE_ACCOUNT_EMAIL</code>, and <code>GOOGLE_PRIVATE_KEY</code>.
              </li>
            </ol>
          </div>

          <div
            style={{
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-elevated)',
              fontSize: '12px',
              color: 'var(--text-muted)'
            }}
          >
            📘 Detailed instructions are documented in <strong>GOOGLE_SHEETS_SETUP.md</strong> in your workspace root.
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-primary" onClick={onClose}>
            Close Settings
          </button>
        </div>
      </div>
    </div>
  );
}
