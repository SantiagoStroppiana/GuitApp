const Database = require('better-sqlite3');
const path = require('path');
const { app } = require('electron');

let db;

function initDatabase() {
  const isDev = process.env.NODE_ENV === 'development';
  const dbPath = isDev 
    ? path.join(__dirname, 'finance-dev.db')
    : path.join(app.getPath('userData'), 'finance.db');
  
  console.log('Base de datos ubicada en:', dbPath);
  db = new Database(dbPath);

  // Crear tablas
  db.exec(`
    CREATE TABLE IF NOT EXISTS accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      initial_balance REAL NOT NULL,
      current_balance REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      account_id INTEGER NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
      amount REAL NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      date DATE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (account_id) REFERENCES accounts (id)
    );

    CREATE TABLE IF NOT EXISTS expense_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL UNIQUE,
      type TEXT NOT NULL CHECK (type IN ('fixed', 'variable')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Insertar categorías de gastos si no existen
  const categoryCount = db.prepare('SELECT COUNT(*) as count FROM expense_categories').get();
  if (categoryCount.count === 0) {
    insertExpenseCategories();
  }
}

function insertExpenseCategories() {
  console.log('Insertando categorías de gastos...');
  
  const categories = [
    // Gastos fijos
    { category: 'alquiler', type: 'fixed' },
    { category: 'servicios', type: 'fixed' },
    { category: 'internet', type: 'fixed' },
    { category: 'celular', type: 'fixed' },
    { category: 'seguros', type: 'fixed' },
    { category: 'suscripciones', type: 'fixed' },
    { category: 'prestamos', type: 'fixed' },
    
    // Gastos variables
    { category: 'alimentacion', type: 'variable' },
    { category: 'transporte', type: 'variable' },
    { category: 'entretenimiento', type: 'variable' },
    { category: 'compras', type: 'variable' },
    { category: 'salud', type: 'variable' },
    { category: 'educacion', type: 'variable' },
    { category: 'viajes', type: 'variable' },
    { category: 'regalos', type: 'variable' },
    { category: 'otros', type: 'variable' }
  ];

  const insertCategory = db.prepare(`
    INSERT OR IGNORE INTO expense_categories (category, type)
    VALUES (?, ?)
  `);

  categories.forEach(cat => {
    insertCategory.run(cat.category, cat.type);
  });

  console.log('Categorías de gastos insertadas correctamente');
}

function getAccounts() {
  return db.prepare('SELECT * FROM accounts ORDER BY name').all();
}

function createAccount(account) {
  const stmt = db.prepare(`
    INSERT INTO accounts (name, type, initial_balance, current_balance)
    VALUES (?, ?, ?, ?)
  `);
  return stmt.run(account.name, account.type, account.initialBalance, account.initialBalance);
}

function updateAccount(id, account) {
  const stmt = db.prepare(`
    UPDATE accounts SET name = ?, type = ? WHERE id = ?
  `);
  return stmt.run(account.name, account.type, id);
}

function deleteAccount(id) {
  const stmt = db.prepare('DELETE FROM accounts WHERE id = ?');
  return stmt.run(id);
}

function getTransactions(filters = {}) {
  let query = `
    SELECT t.*, a.name as account_name 
    FROM transactions t 
    JOIN accounts a ON t.account_id = a.id
  `;
  const params = [];

  if (filters.accountId) {
    query += ' WHERE t.account_id = ?';
    params.push(filters.accountId);
  }

  if (filters.month && filters.year) {
    query += filters.accountId ? ' AND' : ' WHERE';
    query += ' strftime("%m", t.date) = ? AND strftime("%Y", t.date) = ?';
    params.push(filters.month.toString().padStart(2, '0'), filters.year.toString());
  }

  query += ' ORDER BY t.date DESC';
  return db.prepare(query).all(...params);
}

function createTransaction(transaction) {
  const stmt = db.prepare(`
    INSERT INTO transactions (account_id, type, amount, category, description, date)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  const result = stmt.run(
    transaction.accountId,
    transaction.type,
    transaction.amount,
    transaction.category,
    transaction.description,
    transaction.date
  );

  // Actualizar balance de la cuenta
  const balanceChange = transaction.type === 'income' ? transaction.amount : -transaction.amount;
  const updateBalance = db.prepare('UPDATE accounts SET current_balance = current_balance + ? WHERE id = ?');
  updateBalance.run(balanceChange, transaction.accountId);

  return result;
}

function updateTransaction(id, transaction) {
  // Obtener transacción original para revertir balance
  const original = db.prepare('SELECT * FROM transactions WHERE id = ?').get(id);
  if (original) {
    const originalChange = original.type === 'income' ? -original.amount : original.amount;
    const updateBalance = db.prepare('UPDATE accounts SET current_balance = current_balance + ? WHERE id = ?');
    updateBalance.run(originalChange, original.account_id);
  }

  const stmt = db.prepare(`
    UPDATE transactions SET account_id = ?, type = ?, amount = ?, category = ?, description = ?, date = ?
    WHERE id = ?
  `);
  
  const result = stmt.run(
    transaction.accountId,
    transaction.type,
    transaction.amount,
    transaction.category,
    transaction.description,
    transaction.date,
    id
  );

  // Aplicar nuevo balance
  const balanceChange = transaction.type === 'income' ? transaction.amount : -transaction.amount;
  const updateBalance = db.prepare('UPDATE accounts SET current_balance = current_balance + ? WHERE id = ?');
  updateBalance.run(balanceChange, transaction.accountId);

  return result;
}

function deleteTransaction(id) {
  const transaction = db.prepare('SELECT * FROM transactions WHERE id = ?').get(id);
  if (transaction) {
    const balanceChange = transaction.type === 'income' ? -transaction.amount : transaction.amount;
    const updateBalance = db.prepare('UPDATE accounts SET current_balance = current_balance + ? WHERE id = ?');
    updateBalance.run(balanceChange, transaction.account_id);
  }
  
  const stmt = db.prepare('DELETE FROM transactions WHERE id = ?');
  return stmt.run(id);
}

function getMonthlyBalance(month, year) {
  const monthStr = month.toString().padStart(2, '0');
  const yearStr = year.toString();

  const income = db.prepare(`
    SELECT COALESCE(SUM(amount), 0) as total
    FROM transactions 
    WHERE type = 'income' 
    AND strftime("%m", date) = ? 
    AND strftime("%Y", date) = ?
  `).get(monthStr, yearStr);

  const expenses = db.prepare(`
    SELECT COALESCE(SUM(amount), 0) as total
    FROM transactions 
    WHERE type = 'expense' 
    AND strftime("%m", date) = ? 
    AND strftime("%Y", date) = ?
  `).get(monthStr, yearStr);

  const byCategory = db.prepare(`
    SELECT t.category, t.type, SUM(t.amount) as total,
           COALESCE(ec.type, 'variable') as expense_type
    FROM transactions t
    LEFT JOIN expense_categories ec ON t.category = ec.category
    WHERE strftime("%m", t.date) = ? 
    AND strftime("%Y", t.date) = ?
    GROUP BY t.category, t.type
    ORDER BY total DESC
  `).all(monthStr, yearStr);

  return {
    income: income.total,
    expenses: expenses.total,
    balance: income.total - expenses.total,
    byCategory
  };
}

function getExpenseCategories() {
  return db.prepare('SELECT * FROM expense_categories ORDER BY category').all();
}

function getFixedAndVariableExpenses(month, year) {
  const monthStr = month.toString().padStart(2, '0');
  const yearStr = year.toString();

  const fixedExpenses = db.prepare(`
    SELECT t.category, SUM(t.amount) as total
    FROM transactions t
    JOIN expense_categories ec ON t.category = ec.category
    WHERE t.type = 'expense'
    AND ec.type = 'fixed'
    AND strftime("%m", t.date) = ?
    AND strftime("%Y", t.date) = ?
    GROUP BY t.category
    ORDER BY total DESC
  `).all(monthStr, yearStr);

  const variableExpenses = db.prepare(`
    SELECT t.category, SUM(t.amount) as total
    FROM transactions t
    LEFT JOIN expense_categories ec ON t.category = ec.category
    WHERE t.type = 'expense'
    AND (ec.type = 'variable' OR ec.type IS NULL)
    AND strftime("%m", t.date) = ?
    AND strftime("%Y", t.date) = ?
    GROUP BY t.category
    ORDER BY total DESC
  `).all(monthStr, yearStr);

  const fixedTotal = fixedExpenses.reduce((sum, exp) => sum + exp.total, 0);
  const variableTotal = variableExpenses.reduce((sum, exp) => sum + exp.total, 0);

  return {
    fixed: { expenses: fixedExpenses, total: fixedTotal },
    variable: { expenses: variableExpenses, total: variableTotal }
  };
}

module.exports = {
  initDatabase,
  getAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getMonthlyBalance,
  getExpenseCategories,
  getFixedAndVariableExpenses,
  insertExpenseCategories
};