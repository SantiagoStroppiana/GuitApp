import { useState } from 'react'
import '../styles/TransactionManager.css'

const TransactionManager = ({ accounts, transactions, onTransactionCreated }) => {
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [filters, setFilters] = useState({
    accountId: '',
    category: '',
    type: '',
    dateFrom: '',
    dateTo: ''
  })
  const [formData, setFormData] = useState({
    accountId: '',
    type: 'expense',
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  })

  const incomeCategories = ['sueldo', 'ahorro', 'inversiones', 'transferencias', 'freelance', 'otros']
  const expenseCategories = ['alimentacion', 'transporte', 'entretenimiento', 'servicios', 'salud', 'compras', 'educacion', 'otros']

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (window.electronAPI) {
      const transactionData = {
        accountId: parseInt(formData.accountId),
        type: formData.type,
        amount: parseFloat(formData.amount),
        category: formData.category,
        description: formData.description,
        date: formData.date
      }
      
      if (editingId) {
        await window.electronAPI.updateTransaction(editingId, transactionData)
      } else {
        await window.electronAPI.createTransaction(transactionData)
      }
      
      resetForm()
      onTransactionCreated()
    }
  }

  const handleEdit = (transaction) => {
    setFormData({
      accountId: transaction.account_id.toString(),
      type: transaction.type,
      amount: transaction.amount.toString(),
      category: transaction.category,
      description: transaction.description,
      date: transaction.date
    })
    setEditingId(transaction.id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta transacción?')) {
      if (window.electronAPI) {
        await window.electronAPI.deleteTransaction(id)
        onTransactionCreated()
      }
    }
  }

  const resetForm = () => {
    setFormData({
      accountId: '',
      type: 'expense',
      amount: '',
      category: '',
      description: '',
      date: new Date().toISOString().split('T')[0]
    })
    setEditingId(null)
    setShowForm(false)
  }

  const filteredTransactions = transactions.filter(transaction => {
    return (
      (!filters.accountId || transaction.account_id.toString() === filters.accountId) &&
      (!filters.category || transaction.category === filters.category) &&
      (!filters.type || transaction.type === filters.type) &&
      (!filters.dateFrom || transaction.date >= filters.dateFrom) &&
      (!filters.dateTo || transaction.date <= filters.dateTo)
    )
  })

  const categories = formData.type === 'income' ? incomeCategories : expenseCategories
  const allCategories = [...new Set([...incomeCategories, ...expenseCategories])]

  return (
    <div className="transaction-manager">
      <div className="transaction-header">
        <h2>Gestión de Transacciones</h2>
        <button className="btn btn-primary" onClick={() => showForm ? resetForm() : setShowForm(true)}>
          {showForm ? 'Cancelar' : 'Nueva Transacción'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="transaction-form">
          <div className="transaction-form-grid">
            <div className="form-group">
              <label>Cuenta:</label>
              <select
                className="form-control"
                value={formData.accountId}
                onChange={(e) => setFormData({...formData, accountId: e.target.value})}
                required
              >
                <option value="">Seleccionar cuenta</option>
                {accounts.map(account => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Tipo:</label>
              <select
                className="form-control"
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value, category: ''})}
              >
                <option value="expense">Gasto</option>
                <option value="income">Ingreso</option>
              </select>
            </div>
            <div className="form-group">
              <label>Monto:</label>
              <input
                type="number"
                step="0.01"
                className="form-control"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Categoría:</label>
              <select
                className="form-control"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                required
              >
                <option value="">Seleccionar categoría</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Descripción:</label>
              <input
                type="text"
                className="form-control"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Fecha:</label>
              <input
                type="date"
                className="form-control"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                required
              />
            </div>
          </div>
          <button type="submit" className="btn btn-success">
            {editingId ? 'Actualizar Transacción' : 'Crear Transacción'}
          </button>
        </form>
      )}

      <div className="transaction-filters">
        <h3>Filtros</h3>
        <div className="filters-grid">
          <div className="form-group">
            <label>Cuenta:</label>
            <select
              className="form-control"
              value={filters.accountId}
              onChange={(e) => setFilters({...filters, accountId: e.target.value})}
            >
              <option value="">Todas las cuentas</option>
              {accounts.map(account => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Tipo:</label>
            <select
              className="form-control"
              value={filters.type}
              onChange={(e) => setFilters({...filters, type: e.target.value})}
            >
              <option value="">Todos</option>
              <option value="income">Ingresos</option>
              <option value="expense">Gastos</option>
            </select>
          </div>
          <div className="form-group">
            <label>Categoría:</label>
            <select
              className="form-control"
              value={filters.category}
              onChange={(e) => setFilters({...filters, category: e.target.value})}
            >
              <option value="">Todas</option>
              {allCategories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Desde:</label>
            <input
              type="date"
              className="form-control"
              value={filters.dateFrom}
              onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label>Hasta:</label>
            <input
              type="date"
              className="form-control"
              value={filters.dateTo}
              onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
            />
          </div>
          <div className="form-group">
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => setFilters({accountId: '', category: '', type: '', dateFrom: '', dateTo: ''})}
            >
              Limpiar
            </button>
          </div>
        </div>
      </div>

      <div className="transactions-list">
        <h3>Transacciones ({filteredTransactions.length})</h3>
        {filteredTransactions.length === 0 ? (
          <div className="empty-state">
            <h3>No hay transacciones</h3>
            <p>No se encontraron transacciones con los filtros aplicados</p>
          </div>
        ) : (
          <div className="transaction-table-container">
            <table className="transaction-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Cuenta</th>
                  <th>Tipo</th>
                  <th>Categoría</th>
                  <th>Descripción</th>
                  <th>Monto</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map(transaction => (
                  <tr key={transaction.id}>
                    <td>{new Date(transaction.date).toLocaleDateString()}</td>
                    <td>{transaction.account_name}</td>
                    <td>
                      <span className={`transaction-type ${transaction.type}`}>
                        {transaction.type === 'income' ? 'Ingreso' : 'Gasto'}
                      </span>
                    </td>
                    <td style={{textTransform: 'capitalize'}}>{transaction.category}</td>
                    <td>{transaction.description}</td>
                    <td className={`transaction-amount ${transaction.type}`}>
                      {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                    </td>
                    <td>
                      <div className="transaction-actions">
                        <button 
                          className="btn btn-secondary"
                          onClick={() => handleEdit(transaction)}
                        >
                          Editar
                        </button>
                        <button 
                          className="btn btn-danger"
                          onClick={() => handleDelete(transaction.id)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default TransactionManager