const { google } = require('googleapis');
const { JWT } = require('google-auth-library');
const path = require('path');

class GoogleSheetsService {
  constructor() {
    this.spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
    this.auth = null;
    this.sheets = null;
    this.initialized = false;
  }

  async ensureInitialized() {
    if (!this.initialized) {
      await this.initializeAuth();
    }
  }

  /**
 * Update a specific row in a sheet
 */
async updateRow(sheetName, rowIndex, values) {
  try {
    const response = await this.sheets.spreadsheets.values.update({
      spreadsheetId: this.spreadsheetId,
      range: `${sheetName}!${rowIndex}:${rowIndex}`,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [values]
      }
    });

    console.log(`✅ Row ${rowIndex} updated in ${sheetName}`);
    return response.data;
  } catch (error) {
    console.error(`❌ Error updating row in ${sheetName}:`, error.message);
    throw error;
  }
}

  async initializeAuth() {
    try {
      const keyPath = process.env.GOOGLE_PRIVATE_KEY_PATH || './credentials/google-service-account.json';
      
      this.auth = new JWT({
        keyFile: keyPath,
        scopes: [
          'https://www.googleapis.com/auth/spreadsheets',
          'https://www.googleapis.com/auth/drive.file'
        ]
      });

      await this.auth.authorize();
      this.sheets = google.sheets({ version: 'v4', auth: this.auth });
      this.initialized = true;
      
      console.log('✅ Google Sheets authentication successful');
    } catch (error) {
      console.error('❌ Google Sheets authentication error:', error.message);
      throw error;
    }
  }

  /**
   * Get data from a specific sheet
   */
  async getSheetData(sheetName, range = null) {
    await this.ensureInitialized();
    try {
      const sheetRange = range ? `${sheetName}!${range}` : sheetName;
      
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: sheetRange,
      });

      return response.data.values || [];
    } catch (error) {
      console.error(`Error getting sheet data from ${sheetName}:`, error.message);
      throw error;
    }
  }

  /**
   * Append data to a sheet
   */
  async appendToSheet(sheetName, values) {
    try {
      const response = await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: `${sheetName}!A:ZZ`,
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        resource: {
          values: [values]
        }
      });

      console.log(`✅ Data appended to ${sheetName}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Error appending to sheet ${sheetName}:`, error.message);
      throw error;
    }
  }

  /**
   * Find row by column value
   */
  async findRowByValue(sheetName, searchColumn, searchValue) {
    try {
      const data = await this.getSheetData(sheetName);
      
      if (!data || data.length === 0) return null;
      
      const headers = data[0];
      const columnIndex = headers.indexOf(searchColumn);
      
      if (columnIndex === -1) return null;

      for (let i = 1; i < data.length; i++) {
        if (data[i][columnIndex] === searchValue) {
          const rowData = {};
          headers.forEach((header, index) => {
            rowData[header] = data[i][index] || '';
          });
          rowData._rowIndex = i + 1;
          return rowData;
        }
      }

      return null;
    } catch (error) {
      console.error(`Error finding row in ${sheetName}:`, error.message);
      throw error;
    }
  }

  /**
   * Generate unique ID
   */
  generateId() {
    return 'ID_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Get current timestamp
   */
  getCurrentTimestamp() {
    return new Date().toISOString();
  }

  /**
   * Test connection to Google Sheets
   */
  async testConnection() {
    await this.ensureInitialized();
    try {
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId: this.spreadsheetId
      });
      
      console.log(`✅ Connected to spreadsheet: ${response.data.properties.title}`);
      return {
        success: true,
        title: response.data.properties.title,
        sheets: response.data.sheets.map(sheet => sheet.properties.title)
      };
    } catch (error) {
      console.error('❌ Google Sheets connection test failed:', error.message);
      throw error;
    }
  }
}

module.exports = new GoogleSheetsService();