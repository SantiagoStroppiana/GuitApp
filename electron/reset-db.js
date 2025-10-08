const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Función para resetear la base de datos limpia
function resetDatabase() {
  const dbPath = path.join(__dirname, 'finance-dev.db');
  
  // Eliminar base de datos existente
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
    console.log('Base de datos anterior eliminada');
  }

  const db = new Database(dbPath);
  console.log('Nueva base de datos creada en:', dbPath);

  // Crear tablas
  db.exec(`
    CREATE TABLE accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      initial_balance REAL NOT NULL,
      current_balance REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE transactions (
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

    CREATE TABLE expense_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL UNIQUE,
      type TEXT NOT NULL CHECK (type IN ('fixed', 'variable')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Insertar solo categorías de gastos
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
    INSERT INTO expense_categories (category, type)
    VALUES (?, ?)
  `);

  categories.forEach(cat => {
    insertCategory.run(cat.category, cat.type);
  });

  console.log(`${categories.length} categorías de gastos insertadas`);



  // Mostrar resumen
  const categoriesResult = db.prepare('SELECT * FROM expense_categories').all();

  console.log('\n=== BASE DE DATOS LIMPIA ===');
  console.log('Categorías de gastos disponibles:');
  console.log('\nGastos Fijos:');
  categoriesResult.filter(cat => cat.type === 'fixed').forEach(cat => {
    console.log(`- ${cat.category}`);
  });
  console.log('\nGastos Variables:');
  categoriesResult.filter(cat => cat.type === 'variable').forEach(cat => {
    console.log(`- ${cat.category}`);
  });
  console.log('\n¡Base de datos limpia y lista!');
  console.log('Ejecuta "npm run electron-dev" para comenzar a usar la aplicación');

  db.close();
}

function getDateString(baseDate, daysOffset) {
  const date = new Date(baseDate);
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString().split('T')[0];
}

// Ejecutar si se llama directamente
if (require.main === module) {
  resetDatabase();
}

module.exports = { resetDatabase };