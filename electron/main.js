const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { initDatabase, getAccounts, createAccount, updateAccount, deleteAccount, getTransactions, createTransaction, updateTransaction, deleteTransaction, getMonthlyBalance } = require('./db');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  const isDev = process.env.NODE_ENV === 'development';
  
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  initDatabase();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// IPC handlers
ipcMain.handle('get-accounts', () => getAccounts());
ipcMain.handle('create-account', (event, account) => createAccount(account));
ipcMain.handle('update-account', (event, id, account) => updateAccount(id, account));
ipcMain.handle('delete-account', (event, id) => deleteAccount(id));
ipcMain.handle('get-transactions', (event, filters) => getTransactions(filters));
ipcMain.handle('create-transaction', (event, transaction) => createTransaction(transaction));
ipcMain.handle('update-transaction', (event, id, transaction) => updateTransaction(id, transaction));
ipcMain.handle('delete-transaction', (event, id) => deleteTransaction(id));
ipcMain.handle('get-monthly-balance', (event, month, year) => getMonthlyBalance(month, year));