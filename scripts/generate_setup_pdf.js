import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputPath = path.resolve(__dirname, '../PROJECT_SETUP_GUIDE.pdf');
const doc = new PDFDocument({
  size: 'A4',
  margins: { top: 38, bottom: 38, left: 45, right: 45 },
  bufferPages: true
});

const writeStream = fs.createWriteStream(outputPath);
doc.pipe(writeStream);

// Theme Colors
const primary = '#4338ca';
const secondary = '#0f172a';
const darkCard = '#1e1b4b';
const lightBg = '#f8fafc';
const borderColor = '#cbd5e1';
const textColor = '#334155';
const mutedColor = '#64748b';
const codeBg = '#0f172a';
const codeText = '#38bdf8';

// Helpers
function drawHeader(title) {
  doc.moveDown(0.7);
  const startY = doc.y;
  doc.fillColor(primary)
     .font('Helvetica-Bold')
     .fontSize(13)
     .text(title, 45, startY);
  doc.rect(45, doc.y + 2, 505, 1.5).fill(primary);
  doc.moveDown(0.5);
}

function drawSubHeader(title) {
  doc.moveDown(0.35);
  doc.fillColor(secondary)
     .font('Helvetica-Bold')
     .fontSize(10.5)
     .text(title);
  doc.moveDown(0.2);
}

function drawCodeBlock(codeLines, caption = '') {
  doc.moveDown(0.25);
  const blockY = doc.y;
  const padding = 7;
  const lineHeight = 12.5;
  const totalHeight = (codeLines.length * lineHeight) + (caption ? 16 : 0) + (padding * 2);

  doc.rect(45, blockY, 505, totalHeight).fill(codeBg);

  let textY = blockY + padding;
  if (caption) {
    doc.fillColor('#94a3b8').font('Courier-Bold').fontSize(8).text(caption, 55, textY);
    textY += 14;
  }

  doc.fillColor(codeText).font('Courier').fontSize(8.5);
  codeLines.forEach(line => {
    doc.text(line, 55, textY, { width: 485 });
    textY += lineHeight;
  });

  doc.y = blockY + totalHeight + 6;
}

// ==================== PAGE 1: Architecture & Google Sheets ====================

// Top Title Banner
doc.rect(45, 38, 505, 75).fill(darkCard);
doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(20).text('BugTracker Pro', 65, 52);
doc.fillColor('#c7d2fe').font('Helvetica-Bold').fontSize(13).text('Complete Setup, GitHub & Server Deployment Guide', 65, 76);
doc.fillColor('#94a3b8').font('Helvetica').fontSize(9).text('Pure Google Sheets Database • Multi-Application • React & Express • PM2', 65, 92);

doc.y = 123;

// Section 1: Executive Overview
drawHeader('1. Architecture & Core Concept');
doc.fillColor(textColor).font('Helvetica').fontSize(9).text(
  'BugTracker Pro is a fullstack bug tracking web application designed to track issues across multiple applications and websites in real time. It utilizes Google Sheets as its primary, single source of truth database, providing seamless team collaboration with zero licensing fees and zero local database maintenance.',
  { lineGap: 2.5 }
);

doc.moveDown(0.4);

// Key Features Card
const featY = doc.y;
doc.rect(45, featY, 505, 68).fillAndStroke(lightBg, borderColor);
doc.fillColor(secondary).font('Helvetica-Bold').fontSize(9.5).text('SYSTEM HIGHLIGHTS:', 58, featY + 8);
doc.fillColor(textColor).font('Helvetica').fontSize(8.5)
   .text('• 100% Google Sheets Driven: Zero localStorage; all tickets, apps, and team members sync directly.', 58, featY + 22)
   .text('• Step 1 App Hub: Interactive project cards with live Critical, Active, and Resolved bug counters.', 58, featY + 34)
   .text('• Mobile-First Design: Bottom navigation bar, touch targets (min 44px), and device auto-detection.', 58, featY + 46)
   .text('• Dual Workspaces: Drag-and-drop Kanban board + multi-filtered searchable data table.', 58, featY + 58);

doc.y = featY + 76;

// Section 2: Google Sheets Setup
drawHeader('2. Google Sheets Configuration (4 Simple Steps)');

drawSubHeader('Step 1: Create a Google Spreadsheet');
doc.fillColor(textColor).font('Helvetica').fontSize(9)
   .text('1. Visit https://sheets.new and name your spreadsheet (e.g., "Company Bug Tracker").')
   .text('2. Extract the Spreadsheet ID from the URL bar in your browser:');

drawCodeBlock([
  'https://docs.google.com/spreadsheets/d/ [SPREADSHEET_ID_HERE] /edit'
], 'Spreadsheet ID Location:');

drawSubHeader('Step 2: Create a Google Cloud Service Account (Free)');
doc.fillColor(textColor).font('Helvetica').fontSize(9)
   .text('1. Open the Google Cloud Console at https://console.cloud.google.com.')
   .text('2. Create a new project (e.g., "bugtracker-app").')
   .text('3. In the search box, search for "Google Sheets API" and click Enable.')
   .text('4. Go to APIs & Services > Credentials > Create Credentials > Service Account.')
   .text('5. Name it "sheet-sync-bot", click Done, then select the new account.')
   .text('6. Go to the Keys tab > Add Key > Create new key > Select JSON > Create.')
   .text('7. A JSON credentials file will download to your machine.');

drawSubHeader('Step 3: Share the Google Sheet with the Service Account');
doc.fillColor(textColor).font('Helvetica').fontSize(9)
   .text('1. Open your downloaded JSON key file and copy the "client_email" value.')
   .text('2. Return to your Google Sheet and click the Share button (top right).')
   .text('3. Paste the service account email, assign role "Editor", and click Share.');

// ==================== PAGE 2: Env, Schema & Git Security ====================
doc.addPage();

drawSubHeader('Step 4: Add Credentials to server/.env');
doc.fillColor(textColor).font('Helvetica').fontSize(9)
   .text('Paste your Google Sheet ID and Service Account details into server/.env:');

drawCodeBlock([
  'PORT=5000',
  'GOOGLE_SHEET_ID=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
  'GOOGLE_SERVICE_ACCOUNT_EMAIL=sheet-sync-bot@my-project.iam.gserviceaccount.com',
  'GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nMIIEvgIB...\\n-----END PRIVATE KEY-----\\n"',
  '# Alternative: GOOGLE_SERVICE_ACCOUNT_KEY_FILE=./service-account-key.json'
], 'server/.env Configuration:');

drawHeader('3. Automated Google Sheet Tabs & Schema');
doc.fillColor(textColor).font('Helvetica').fontSize(9)
   .text('The server automatically initializes 3 tabs with complete column headers on first boot:');

doc.moveDown(0.2);

const tabs = [
  { name: 'Tab 1: "Bugs"', cols: 'id, title, appId, appName, severity, status, category, environment, deviceInfo, url, description, screenshotUrl, reporter, assignee, createdAt, updatedAt' },
  { name: 'Tab 2: "Apps"', cols: 'id, name, url, environment, platform, description, color, icon' },
  { name: 'Tab 3: "Team"', cols: 'id, name, role, email, avatar' }
];

tabs.forEach(t => {
  doc.fillColor(secondary).font('Helvetica-Bold').fontSize(9).text(t.name);
  doc.fillColor('#4338ca').font('Courier').fontSize(7.5).text(`Columns: ${t.cols}`, { lineGap: 1 });
  doc.moveDown(0.2);
});

drawHeader('4. Unwanted Files for Server & .gitignore Security');
doc.fillColor(textColor).font('Helvetica').fontSize(9)
   .text('To protect credentials and prevent server bloat, the following are strictly excluded from GitHub:');

doc.moveDown(0.3);

const gitignoreY = doc.y;
doc.rect(45, gitignoreY, 505, 100).fillAndStroke(lightBg, borderColor);
doc.fillColor(secondary).font('Helvetica-Bold').fontSize(9).text('EXCLUDED IN .gitignore:', 55, gitignoreY + 8);
doc.fillColor(textColor).font('Courier').fontSize(8)
   .text('• Secrets & Keys:        .env, .env.* (only .env.example committed), *.json keys', 55, gitignoreY + 22)
   .text('• Heavy Dependencies:    node_modules/ (never push node_modules to GitHub)', 55, gitignoreY + 36)
   .text('• Build Artifacts:       dist/, build/ (built directly on the server for production)', 55, gitignoreY + 50)
   .text('• Runtime Logs:          *.log, npm-debug.log*, logs/ (server process logs)', 55, gitignoreY + 64)
   .text('• System/Editor Junk:    .DS_Store, Thumbs.db, .vscode/, .idea/', 55, gitignoreY + 78);

doc.y = gitignoreY + 108;

drawHeader('5. Local Development Commands');
drawCodeBlock([
  'npm run dev      # Starts Express API (port 5000) & Vite React (port 5173)'
], 'Development Quickstart:');

// ==================== PAGE 3: Server Deployment via GitHub ====================
doc.addPage();

drawHeader('6. How to Deploy on Linux Server Using GitHub');

doc.fillColor(textColor).font('Helvetica').fontSize(9).text(
  'Follow this standard enterprise guide to deploy the Bug Tracker onto your Linux server (Ubuntu/Debian, VPS, AWS EC2, or DigitalOcean) via GitHub.',
  { lineGap: 2.5 }
);

drawSubHeader('Step A: Push Project to Your Private GitHub Repository');
drawCodeBlock([
  'git init',
  'git add .',
  'git commit -m "feat: initial commit of bug tracker"',
  'git branch -M main',
  'git remote add origin https://github.com/YOUR_USERNAME/bug-tracker.git',
  'git push -u origin main'
], 'Local Terminal (Push to GitHub):');

drawSubHeader('Step B: Clone on Server & Install Production Dependencies');
drawCodeBlock([
  '# Connect to your server via SSH',
  'ssh username@your-server-ip',
  '',
  '# Clone repository and enter directory',
  'git clone https://github.com/YOUR_USERNAME/bug-tracker.git',
  'cd bug-tracker',
  '',
  '# Install dependencies for root, server, and client',
  'npm run install:all'
], 'Server Terminal (Clone & Install):');

drawSubHeader('Step C: Create Server .env & Build Frontend');
drawCodeBlock([
  '# Copy template and edit with your production Google Sheet credentials',
  'cp server/.env.example server/.env',
  'nano server/.env    # (Paste GOOGLE_SHEET_ID and Service Account key)',
  '',
  '# Build the React production bundle',
  'npm run build'
], 'Server Terminal (Environment & Build):');

drawSubHeader('Step D: Keep Server Running 24/7 with PM2');
drawCodeBlock([
  '# Install PM2 process manager globally',
  'npm install -g pm2',
  '',
  '# Start Bug Tracker server as background service',
  'pm2 start server/server.js --name "bug-tracker"',
  '',
  '# Enable auto-restart on server reboot',
  'pm2 startup && pm2 save'
], 'Server Terminal (PM2 Process Management):');

drawSubHeader('Step E: Fast Continuous Updates (Future Deployments)');
doc.fillColor(textColor).font('Helvetica').fontSize(8.5)
   .text('Whenever you push new code to GitHub, simply update your server in 3 lines:');
drawCodeBlock([
  'git pull',
  'npm run build',
  'pm2 restart bug-tracker'
], 'Updating Live Server:');

// Page Footers
const range = doc.bufferedPageRange();
for (let i = 0; i < range.count; i++) {
  doc.switchToPage(i);
  doc.fillColor(mutedColor)
     .font('Helvetica')
     .fontSize(8)
     .text(`BugTracker Pro Setup & Deployment Guide — Page ${i + 1} of ${range.count}`, 45, 770, {
       align: 'center',
       width: 505,
       lineBreak: false
     });
}

doc.end();

writeStream.on('finish', () => {
  console.log('✅ Updated PDF generated successfully at:', outputPath);
});
