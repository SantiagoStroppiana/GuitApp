const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Cuentas
  getAccounts: () => ipcRenderer.invoke('get-accounts'),
  createAccount: (account) => ipcRenderer.invoke('create-account', account),
  updateAccount: (id, account) => ipcRenderer.invoke('update-account', id, account),
  deleteAccount: (id) => ipcRenderer.invoke('delete-account', id),
  
  // Transacciones
  getTransactions: (filters) => ipcRenderer.invoke('get-transactions', filters),
  createTransaction: (transaction) => ipcRenderer.invoke('create-transaction', transaction),
  updateTransaction: (id, transaction) => ipcRenderer.invoke('update-transaction', id, transaction),
  deleteTransaction: (id) => ipcRenderer.invoke('delete-transaction', id),
  
  // Balance mensual
  getMonthlyBalance: (month, year) => ipcRenderer.invoke('get-monthly-balance', month, year),
  
  // Categorías de gastos
  getExpenseCategories: () => ipcRenderer.invoke('get-expense-categories'),
  getFixedAndVariableExpenses: (month, year) => ipcRenderer.invoke('get-fixed-variable-expenses', month, year)
});