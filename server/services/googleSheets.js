import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { defaultApps, defaultBugs, defaultTeam } from '../data/defaultData.js';

export const BUG_HEADERS = [
  'id', 'title', 'appId', 'appName', 'severity', 'status', 'category',
  'environment', 'deviceInfo', 'url', 'description', 'screenshotUrl',
  'reporter', 'assignee', 'createdAt', 'updatedAt'
];

export const APP_HEADERS = [
  'id', 'name', 'url', 'environment', 'platform', 'description', 'color', 'icon'
];

export const TEAM_HEADERS = [
  'id', 'name', 'role', 'email', 'avatar'
];

class GoogleSheetsService {
  constructor() {
    this.sheetsClient = null;
    this.spreadsheetId = null;
    this.isConnected = false;
    this.connectionError = null;
  }

  async init() {
    this.spreadsheetId = process.env.GOOGLE_SHEET_ID?.trim();

    if (!this.spreadsheetId) {
      this.isConnected = false;
      this.connectionError = 'GOOGLE_SHEET_ID is not configured in .env';
      return false;
    }

    try {
      let authClient;

      // Option A: Key file provided
      if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE) {
        const keyPath = path.resolve(process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE);
        if (fs.existsSync(keyPath)) {
          const keyData = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
          authClient = new google.auth.JWT(
            keyData.client_email,
            null,
            keyData.private_key,
            ['https://www.googleapis.com/auth/spreadsheets']
          );
        }
      }

      // Option B: Inline email & private key
      if (!authClient && process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
        let privateKey = process.env.GOOGLE_PRIVATE_KEY;
        if (privateKey.includes('\\n')) {
          privateKey = privateKey.replace(/\\n/g, '\n');
        }
        if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
          privateKey = privateKey.slice(1, -1);
        }

        authClient = new google.auth.JWT(
          process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL.trim(),
          null,
          privateKey,
          ['https://www.googleapis.com/auth/spreadsheets']
        );
      }

      if (!authClient) {
        this.isConnected = false;
        this.connectionError = 'No Google Service Account credentials provided in .env';
        return false;
      }

      await authClient.authorize();
      this.sheetsClient = google.sheets({ version: 'v4', auth: authClient });

      // Verify connection by reading metadata
      await this.sheetsClient.spreadsheets.get({
        spreadsheetId: this.spreadsheetId
      });

      this.isConnected = true;
      this.connectionError = null;
      console.log('✅ Google Sheets connection established successfully!');

      // Ensure necessary tabs and headers exist in the Google Sheet
      await this.ensureSheetStructure();
      return true;
    } catch (err) {
      this.isConnected = false;
      this.connectionError = err.message || 'Failed to authenticate with Google Sheets';
      console.warn('⚠️ Google Sheets connection warning:', this.connectionError);
      return false;
    }
  }

  async ensureSheetStructure() {
    if (!this.isConnected) return;
    try {
      const meta = await this.sheetsClient.spreadsheets.get({
        spreadsheetId: this.spreadsheetId
      });
      const sheetTitles = meta.data.sheets.map(s => s.properties.title);

      const neededSheets = ['Bugs', 'Apps', 'Team'];
      const requests = [];
      neededSheets.forEach(title => {
        if (!sheetTitles.includes(title)) {
          requests.push({ addSheet: { properties: { title } } });
        }
      });

      if (requests.length > 0) {
        await this.sheetsClient.spreadsheets.batchUpdate({
          spreadsheetId: this.spreadsheetId,
          requestBody: { requests }
        });
      }

      // Check header on Bugs
      const bugsRes = await this.sheetsClient.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'Bugs!A1:P'
      });
      if (!bugsRes.data.values || bugsRes.data.values.length === 0) {
        const seedRows = [
          BUG_HEADERS,
          ...defaultBugs.map(b => BUG_HEADERS.map(k => b[k] || ''))
        ];
        await this.sheetsClient.spreadsheets.values.update({
          spreadsheetId: this.spreadsheetId,
          range: `Bugs!A1:P${seedRows.length}`,
          valueInputOption: 'USER_ENTERED',
          requestBody: { values: seedRows }
        });
      }

      // Check header on Apps
      const appsRes = await this.sheetsClient.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'Apps!A1:H'
      });
      if (!appsRes.data.values || appsRes.data.values.length === 0) {
        const seedRows = [
          APP_HEADERS,
          ...defaultApps.map(a => APP_HEADERS.map(k => a[k] || ''))
        ];
        await this.sheetsClient.spreadsheets.values.update({
          spreadsheetId: this.spreadsheetId,
          range: `Apps!A1:H${seedRows.length}`,
          valueInputOption: 'USER_ENTERED',
          requestBody: { values: seedRows }
        });
      }

      // Check header on Team
      const teamRes = await this.sheetsClient.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'Team!A1:E'
      });
      if (!teamRes.data.values || teamRes.data.values.length === 0) {
        const seedRows = [
          TEAM_HEADERS,
          ...defaultTeam.map(t => TEAM_HEADERS.map(k => t[k] || ''))
        ];
        await this.sheetsClient.spreadsheets.values.update({
          spreadsheetId: this.spreadsheetId,
          range: `Team!A1:E${seedRows.length}`,
          valueInputOption: 'USER_ENTERED',
          requestBody: { values: seedRows }
        });
      }
    } catch (err) {
      console.error('Error ensuring sheet structure:', err.message);
    }
  }

  async getBugs() {
    if (!this.isConnected) {
      throw new Error(`Google Sheets not connected: ${this.connectionError}`);
    }
    const res = await this.sheetsClient.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: 'Bugs!A2:P'
    });
    const rows = res.data.values || [];
    return rows.map(row => {
      const bug = {};
      BUG_HEADERS.forEach((key, index) => {
        bug[key] = row[index] !== undefined ? row[index] : '';
      });
      return bug;
    });
  }

  async getApps() {
    if (!this.isConnected) {
      throw new Error(`Google Sheets not connected: ${this.connectionError}`);
    }
    const res = await this.sheetsClient.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: 'Apps!A2:H'
    });
    const rows = res.data.values || [];
    return rows.map(row => {
      const app = {};
      APP_HEADERS.forEach((key, index) => {
        app[key] = row[index] !== undefined ? row[index] : '';
      });
      return app;
    });
  }

  async getTeam() {
    if (!this.isConnected) {
      throw new Error(`Google Sheets not connected: ${this.connectionError}`);
    }
    const res = await this.sheetsClient.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: 'Team!A2:E'
    });
    const rows = res.data.values || [];
    return rows.map(row => {
      const member = {};
      TEAM_HEADERS.forEach((key, index) => {
        member[key] = row[index] !== undefined ? row[index] : '';
      });
      return member;
    });
  }

  async addBug(bug) {
    if (!this.isConnected) {
      throw new Error(`Google Sheets not connected: ${this.connectionError}`);
    }
    const row = BUG_HEADERS.map(key => bug[key] || '');
    await this.sheetsClient.spreadsheets.values.append({
      spreadsheetId: this.spreadsheetId,
      range: 'Bugs!A:P',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: [row] }
    });
    return bug;
  }

  async addApp(app) {
    if (!this.isConnected) {
      throw new Error(`Google Sheets not connected: ${this.connectionError}`);
    }
    const row = APP_HEADERS.map(key => app[key] || '');
    await this.sheetsClient.spreadsheets.values.append({
      spreadsheetId: this.spreadsheetId,
      range: 'Apps!A:H',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: [row] }
    });
    return app;
  }

  async addTeamMember(member) {
    if (!this.isConnected) {
      throw new Error(`Google Sheets not connected: ${this.connectionError}`);
    }
    const row = TEAM_HEADERS.map(key => member[key] || '');
    await this.sheetsClient.spreadsheets.values.append({
      spreadsheetId: this.spreadsheetId,
      range: 'Team!A:E',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: [row] }
    });
    return member;
  }

  async updateBug(id, updatedFields) {
    if (!this.isConnected) {
      throw new Error(`Google Sheets not connected: ${this.connectionError}`);
    }
    const res = await this.sheetsClient.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: 'Bugs!A2:A'
    });
    const rows = res.data.values || [];
    const rowIndex = rows.findIndex(r => r[0] === id);
    if (rowIndex === -1) return null;

    const sheetRowNumber = rowIndex + 2;

    const currentRowRes = await this.sheetsClient.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: `Bugs!A${sheetRowNumber}:P${sheetRowNumber}`
    });
    const currentValues = currentRowRes.data.values?.[0] || [];
    const currentBug = {};
    BUG_HEADERS.forEach((key, i) => {
      currentBug[key] = currentValues[i] || '';
    });

    const merged = { ...currentBug, ...updatedFields, updatedAt: new Date().toISOString() };
    const updatedRow = BUG_HEADERS.map(key => merged[key] || '');

    await this.sheetsClient.spreadsheets.values.update({
      spreadsheetId: this.spreadsheetId,
      range: `Bugs!A${sheetRowNumber}:P${sheetRowNumber}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [updatedRow] }
    });

    return merged;
  }

  async deleteBug(id) {
    if (!this.isConnected) {
      throw new Error(`Google Sheets not connected: ${this.connectionError}`);
    }
    const meta = await this.sheetsClient.spreadsheets.get({
      spreadsheetId: this.spreadsheetId
    });
    const bugsSheet = meta.data.sheets.find(s => s.properties.title === 'Bugs');
    if (!bugsSheet) return false;

    const res = await this.sheetsClient.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: 'Bugs!A2:A'
    });
    const rows = res.data.values || [];
    const rowIndex = rows.findIndex(r => r[0] === id);
    if (rowIndex === -1) return false;

    const startIndex = rowIndex + 1;
    await this.sheetsClient.spreadsheets.batchUpdate({
      spreadsheetId: this.spreadsheetId,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: bugsSheet.properties.sheetId,
                dimension: 'ROWS',
                startIndex: startIndex,
                endIndex: startIndex + 1
              }
            }
          }
        ]
      }
    });

    return true;
  }

  getStatus() {
    return {
      connected: this.isConnected,
      spreadsheetId: this.spreadsheetId ? `${this.spreadsheetId.substring(0, 6)}...` : null,
      fullSpreadsheetId: this.spreadsheetId || null,
      error: this.connectionError
    };
  }
}

export const googleSheetsService = new GoogleSheetsService();
