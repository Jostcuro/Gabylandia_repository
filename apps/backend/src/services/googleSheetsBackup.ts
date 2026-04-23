import { google } from 'googleapis';
import { env } from '../config/env.js';

type BackupAction = 'CREATE' | 'UPDATE' | 'DELETE';

interface BackupPayload {
  action: BackupAction;
  entity: 'EVENT' | 'CHECKLIST_ITEM' | 'TEMPLATE';
  entityId: number;
  payload: string;
}

const isEnabled = Boolean(env.GOOGLE_SERVICE_ACCOUNT_EMAIL && env.GOOGLE_PRIVATE_KEY && env.GOOGLE_SHEETS_ID);

const auth =
  isEnabled && env.GOOGLE_SERVICE_ACCOUNT_EMAIL && env.GOOGLE_PRIVATE_KEY
    ? new google.auth.JWT({
        email: env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        key: env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        scopes: ['https://www.googleapis.com/auth/spreadsheets']
      })
    : null;

const sheets = auth ? google.sheets({ version: 'v4', auth }) : null;

export async function appendBackupRow(entry: BackupPayload): Promise<void> {
  if (!sheets || !env.GOOGLE_SHEETS_ID) return;

  await sheets.spreadsheets.values.append({
    spreadsheetId: env.GOOGLE_SHEETS_ID,
    range: `${env.GOOGLE_SHEETS_TAB}!A:E`,
    valueInputOption: 'RAW',
    requestBody: {
      values: [[new Date().toISOString(), entry.action, entry.entity, entry.entityId, entry.payload]]
    }
  });
}
