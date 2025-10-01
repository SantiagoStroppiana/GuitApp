import { useState } from 'react'
import '../styles/QuickActions.css'

const QuickActions = ({ accounts, onDataChange }) => {
  const [showIncomeForm, setShowIncomeForm] = useState(false)
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [incomeData, setIncomeData] = useState({
    accountId: '',
    amount: '',
    category: 'sueldo',
    description: '',
    date: new Date().toISOString().split('T')[0]
  })
  const [expenseData, setExpenseData] = useState({
    accountId: '',
    amount: '',
    category: 'alimentacion',
    description: '',
    date: new Date().toISOString().split('T')[0]
  })

  const incomeCategories = ['sueldo', 'freelance', 'inversiones', 'transferencias', 'otros']
  const expenseCategories = ['alimentacion', 'transporte', 'entretenimiento', 'servicios', 'compras', 'otros']

  const handleIncomeSubmit = async (e) => {
    e.preventDefault()
    if (window.electronAPI) {
      await window.electronAPI.createTransaction({
        accountId: parseInt(incomeData.accountId),
        type: 'income',
        amount: parseFloat(incomeData.amount),
        category: incomeData.category,
        description: incomeData.description,
        date: incomeData.date
      })
      setIncomeData({
        accountId: '',
        amount: '',
        category: 'sueldo',
        description: '',
        date: new Date().toISOString().split('T')[0]
      })
      setShowIncomeForm(false)
      onDataChange()
    }
  }

  const handleExpenseSubmit = async (e) => {
    e.preventDefault()
    if (window.electronAPI) {
      await window.electronAPI.createTransaction({
        accountId: parseInt(expenseData.accountId),
        type: 'expense',
        amount: parseFloat(expenseData.amount),
        category: expenseData.category,
        description: expenseData.description,
        date: expenseData.date
      })
      setExpenseData({
        accountId: '',
        amount: '',
        category: 'alimentacion',
        description: '',
        date: new Date().toISOString().split('T')[0]
      })
      setShowExpenseForm(false)
      onDataChange()
    }
  }

  return (
    <div className="quick-actions">
      <h3>Acciones Rápidas</h3>
      
      <div className="action-buttons">
        <button 
          className="quick-btn income-btn"
          onClick={() => setShowIncomeForm(!showIncomeForm)}
        >
          <span className="btn-icon">💰</span>
          <span>Nuevo Ingreso</span>
        </button>
        
        <button 
          className="quick-btn expense-btn"
          onClick={() => setShowExpenseForm(!showExpenseForm)}
        >
          <span className="btn-icon">💸</span>
          <span>Nuevo Gasto</span>
        </button>
      </div>

      {showIncomeForm && (
        <div className="quick-form income-form">
          <h4>Registrar Ingreso Rápido</h4>
          <form onSubmit={handleIncomeSubmit}>
            <div className="form-row">
              <select
                className="form-control"
                value={incomeData.accountId}
                onChange={(e) => setIncomeData({...incomeData, accountId: e.target.value})}
                required
              >
                <option value="">Cuenta</option>
                {accounts.map(account => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </select>
              
              <input
                type="number"
                step="0.01"
                className="form-control"
                placeholder="Monto"
                value={incomeData.amount}
                onChange={(e) => setIncomeData({...incomeData, amount: e.target.value})}
                required
              />
              
              <select
                className="form-control"
                value={incomeData.category}
                onChange={(e) => setIncomeData({...incomeData, category: e.target.value})}
              >
                {incomeCategories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            
            <input
              type="text"
              className="form-control"
              placeholder="Descripción (opcional)"
              value={incomeData.description}
              onChange={(e) => setIncomeData({...incomeData, description: e.target.value})}
            />
            
            <div className="form-actions">
              <button type="submit" className="btn btn-success">Guardar</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowIncomeForm(false)}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {showExpenseForm && (
        <div className="quick-form expense-form">
          <h4>Registrar Gasto Rápido</h4>
          <form onSubmit={handleExpenseSubmit}>
            <div className="form-row">
              <select
                className="form-control"
                value={expenseData.accountId}
                onChange={(e) => setExpenseData({...expenseData, accountId: e.target.value})}
                required
              >
                <option value="">Cuenta</option>
                {accounts.map(account => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </select>
              
              <input
                type="number"
                step="0.01"
                className="form-control"
                placeholder="Monto"
                value={expenseData.amount}
                onChange={(e) => setExpenseData({...expenseData, amount: e.target.value})}
                required
              />
              
              <select
                className="form-control"
                value={expenseData.category}
                onChange={(e) => setExpenseData({...expenseData, category: e.target.value})}
              >
                {expenseCategories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            
            <input
              type="text"
              className="form-control"
              placeholder="Descripción (opcional)"
              value={expenseData.description}
              onChange={(e) => setExpenseData({...expenseData, description: e.target.value})}
            />
            
            <div className="form-actions">
              <button type="submit" className="btn btn-success">Guardar</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowExpenseForm(false)}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default QuickActions