import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { googleSheetsService } from './services/googleSheets.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize Google Sheets connection on boot
(async () => {
  await googleSheetsService.init();
})();

// Health & Status
app.get('/api/health', (req, res) => {
  const status = googleSheetsService.getStatus();
  res.json({
    status: status.connected ? 'ok' : 'connection_required',
    timestamp: new Date().toISOString(),
    googleSheets: status
  });
});

// Applications Endpoints (Direct to Google Sheets)
app.get('/api/apps', async (req, res) => {
  try {
    if (!googleSheetsService.isConnected) {
      return res.status(503).json({
        success: false,
        requireSetup: true,
        error: googleSheetsService.connectionError || 'Google Sheets is not connected. Configure server/.env.',
        data: []
      });
    }
    const apps = await googleSheetsService.getApps();
    res.json({ success: true, data: apps || [] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message, data: [] });
  }
});

app.post('/api/apps', async (req, res) => {
  try {
    if (!googleSheetsService.isConnected) {
      return res.status(503).json({
        success: false,
        error: 'Google Sheets connection required to create applications.'
      });
    }

    const { name, url, environment, platform, description, color, icon } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, error: 'App name is required' });
    }

    const newApp = {
      id: `app-${Date.now().toString(36)}`,
      name: name.trim(),
      url: url?.trim() || '',
      environment: environment || 'Production',
      platform: platform || 'Web',
      description: description?.trim() || '',
      color: color || '#6366f1',
      icon: icon || '🚀'
    };

    await googleSheetsService.addApp(newApp);
    res.status(201).json({ success: true, data: newApp });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Bugs Endpoints (Direct to Google Sheets)
app.get('/api/bugs', async (req, res) => {
  try {
    if (!googleSheetsService.isConnected) {
      return res.status(503).json({
        success: false,
        requireSetup: true,
        error: googleSheetsService.connectionError || 'Google Sheets is not connected. Configure server/.env.',
        data: []
      });
    }

    const { appId, status, severity, assignee, search } = req.query;
    const sheetBugs = await googleSheetsService.getBugs();
    let filtered = sheetBugs || [];

    if (appId && appId !== 'all') {
      filtered = filtered.filter(b => b.appId === appId);
    }
    if (status && status !== 'all') {
      filtered = filtered.filter(b => b.status?.toLowerCase() === status.toLowerCase());
    }
    if (severity && severity !== 'all') {
      filtered = filtered.filter(b => b.severity?.toLowerCase() === severity.toLowerCase());
    }
    if (assignee && assignee !== 'all') {
      filtered = filtered.filter(b => b.assignee?.toLowerCase() === assignee.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(b =>
        b.title?.toLowerCase().includes(q) ||
        b.description?.toLowerCase().includes(q) ||
        b.id?.toLowerCase().includes(q) ||
        b.url?.toLowerCase().includes(q)
      );
    }

    filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    res.json({ success: true, count: filtered.length, data: filtered });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message, data: [] });
  }
});

app.post('/api/bugs', async (req, res) => {
  try {
    if (!googleSheetsService.isConnected) {
      return res.status(503).json({
        success: false,
        error: 'Google Sheets connection required to create bugs.'
      });
    }

    const {
      title, appId, appName, severity, category, environment,
      deviceInfo, url, description, screenshotUrl, reporter, assignee
    } = req.body;

    if (!title || !appId) {
      return res.status(400).json({ success: false, error: 'Title and Application are required' });
    }

    const currentBugs = (await googleSheetsService.getBugs()) || [];
    const maxNumber = currentBugs.reduce((max, b) => {
      const match = b.id?.match(/BUG-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        return num > max ? num : max;
      }
      return max;
    }, 100);

    const newBug = {
      id: `BUG-${maxNumber + 1}`,
      title: title.trim(),
      appId,
      appName: appName || 'Application',
      severity: severity || 'Medium',
      status: 'Open',
      category: category || 'Functional',
      environment: environment || 'Production',
      deviceInfo: deviceInfo || '',
      url: url?.trim() || '',
      description: description?.trim() || '',
      screenshotUrl: screenshotUrl?.trim() || '',
      reporter: reporter?.trim() || 'Anonymous',
      assignee: assignee?.trim() || 'Dev Team',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await googleSheetsService.addBug(newBug);
    res.status(201).json({ success: true, data: newBug });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/bugs/:id', async (req, res) => {
  try {
    if (!googleSheetsService.isConnected) {
      return res.status(503).json({
        success: false,
        error: 'Google Sheets connection required to update bugs.'
      });
    }

    const { id } = req.params;
    const updated = await googleSheetsService.updateBug(id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: `Bug ${id} not found in Google Sheets` });
    }

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/bugs/:id', async (req, res) => {
  try {
    if (!googleSheetsService.isConnected) {
      return res.status(503).json({
        success: false,
        error: 'Google Sheets connection required to delete bugs.'
      });
    }

    const { id } = req.params;
    const deleted = await googleSheetsService.deleteBug(id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: `Bug ${id} not found in Google Sheets` });
    }

    res.json({ success: true, message: `Bug ${id} deleted from Google Sheets` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Team Endpoints (Direct to Google Sheets Team tab)
app.get('/api/team', async (req, res) => {
  try {
    if (!googleSheetsService.isConnected) {
      return res.status(503).json({
        success: false,
        requireSetup: true,
        error: 'Google Sheets connection required.',
        data: []
      });
    }
    const team = await googleSheetsService.getTeam();
    res.json({ success: true, data: team || [] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message, data: [] });
  }
});

// Manual Sync & Reconnect
app.post('/api/sync', async (req, res) => {
  try {
    const connected = await googleSheetsService.init();
    if (!connected) {
      return res.status(503).json({
        success: false,
        message: 'Google Sheets is not connected. Configure credentials in server/.env.',
        status: googleSheetsService.getStatus()
      });
    }

    const sheetBugs = await googleSheetsService.getBugs();
    const sheetApps = await googleSheetsService.getApps();
    const sheetTeam = await googleSheetsService.getTeam();

    res.json({
      success: true,
      message: 'Successfully refreshed live data from Google Sheets',
      counts: {
        apps: sheetApps?.length || 0,
        bugs: sheetBugs?.length || 0,
        team: sheetTeam?.length || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Serve frontend build if exists
const clientDistPath = path.resolve(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(clientDistPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Bug Tracker Server running on http://localhost:${PORT}`);
  console.log(`📡 Google Sheets Status: ${googleSheetsService.isConnected ? 'Connected to Google Sheets' : 'Waiting for Google Sheets credentials in .env'}`);
});
