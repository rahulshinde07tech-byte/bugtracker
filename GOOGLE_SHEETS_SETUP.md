# 📊 Google Sheets Setup Guide for Bug Tracker

Follow these simple steps to link your Bug Tracker to a live Google Sheet.

---

## Step 1: Create a Google Sheet
1. Open [Google Sheets](https://sheets.new) and create a new blank spreadsheet.
2. Name it whatever you like (e.g. `Company Bug Tracker`).
3. Copy the **Spreadsheet ID** from your browser address bar:
   ```
   https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
                                         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
   ```
   In this example, the ID is `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms`.

---

## Step 2: Create a Google Cloud Service Account (Free)
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project (e.g., `bug-tracker-sync`).
3. Enable the **Google Sheets API**:
   - In the search bar at the top, type `Google Sheets API`.
   - Click on it and press **Enable**.
4. Create a Service Account:
   - Navigate to **APIs & Services > Credentials**.
   - Click **+ CREATE CREDENTIALS** > **Service Account**.
   - Enter name (e.g., `sheet-sync-bot`) and click **Done**.
5. Generate a Key:
   - Click on your newly created Service Account email.
   - Go to the **Keys** tab > **ADD KEY** > **Create new key** > Select **JSON** > **Create**.
   - A `.json` file will download to your computer.

---

## Step 3: Share the Google Sheet with the Service Account
1. Open the downloaded JSON file and find the `"client_email"` (looks like `sheet-sync-bot@your-project.iam.gserviceaccount.com`).
2. Go back to your Google Sheet in your browser and click the **Share** button in the top right.
3. Paste the Service Account email.
4. Set role to **Editor** and uncheck "Notify people", then click **Share**.

---

## Step 4: Add Credentials to `.env`
Open `/server/.env` and paste:

```env
GOOGLE_SHEET_ID=your_spreadsheet_id_here
GOOGLE_SERVICE_ACCOUNT_EMAIL=sheet-sync-bot@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

*(Alternatively, place the downloaded json file in the `server/` directory and set `GOOGLE_SERVICE_ACCOUNT_KEY_FILE=./service-account-key.json`)*.

---

## ⚡ Instant Demo Mode
If you don't enter Google credentials right now, **the app still works 100% out of the box** using in-memory local caching with pre-populated sample bugs! You can connect your Google Sheet anytime later.
