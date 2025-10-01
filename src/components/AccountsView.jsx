import { useState } from 'react'
import '../styles/AccountsView.css'

const AccountsView = ({ accounts, transactions, onAccountCreated }) => {
  const [selectedAccount, setSelectedAccount] = useState(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    type: 'banco',
    initialBalance: ''
  })

  const accountTypes = [
    { value: 'banco', label: 'Banco', icon: '🏦' },
    { value: 'efectivo', label: 'Efectivo', icon: '💵' },
    { value: 'mercado_pago', label: 'Mercado Pago', icon: '💳' },
    { value: 'billetera_virtual', label: 'Billetera Virtual', icon: '📱' },
    { value: 'tarjeta_transporte', label: 'Tarjeta Transporte', icon: '🚌' }
  ]

  const getAccountTransactions = (accountId) => {
    return transactions
      .filter(t => t.account_id === accountId)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
  }

  const handleCreateAccount = async (e) => {
    e.preventDefault()
    if (window.electronAPI) {
      await window.electronAPI.createAccount({
        name: formData.name,
        type: formData.type,
        initialBalance: parseFloat(formData.initialBalance)
      })
      setFormData({ name: '', type: 'banco', initialBalance: '' })
      setShowCreateForm(false)
      onAccountCreated()
    }
  }

  const getTypeInfo = (type) => {
    return accountTypes.find(t => t.value === type) || { label: type, icon: '💼' }
  }

  return (
    <div className="accounts-view">
      <div className="accounts-header">
        <h2>Gestión de Cuentas</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? 'Cancelar' : '+ Nueva Cuenta'}
        </button>
      </div>

      {showCreateForm && (
        <div className="create-account-form">
          <h3>Crear Nueva Cuenta</h3>
          <form onSubmit={handleCreateAccount}>
            <div className="form-grid-inline">
              <input
                type="text"
                className="form-control"
                placeholder="Nombre de la cuenta"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
              <select
                className="form-control"
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
              >
                {accountTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>
              <input
                type="number"
                step="0.01"
                className="form-control"
                placeholder="Saldo inicial"
                value={formData.initialBalance}
                onChange={(e) => setFormData({...formData, initialBalance: e.target.value})}
                required
              />
              <button type="submit" className="btn btn-success">Crear</button>
            </div>
          </form>
        </div>
      )}

      <div className="accounts-grid-view">
        {accounts.map(account => {
          const typeInfo = getTypeInfo(account.type)
          const accountTransactions = getAccountTransactions(account.id)
          const isSelected = selectedAccount === account.id
          
          return (
            <div key={account.id} className={`account-detail-card ${isSelected ? 'selected' : ''}`}>
              <div className="account-card-header">
                <div className="account-info">
                  <span className="account-icon">{typeInfo.icon}</span>
                  <div>
                    <h3>{account.name}</h3>
                    <span className="account-type-label">{typeInfo.label}</span>
                  </div>
                </div>
                <div className="account-balance-large">
                  ${account.current_balance.toFixed(2)}
                </div>
              </div>
              
              <div className="account-stats">
                <div className="stat">
                  <span className="stat-label">Transacciones</span>
                  <span className="stat-value">{accountTransactions.length}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Este mes</span>
                  <span className="stat-value">
                    {accountTransactions.filter(t => {
                      const transactionDate = new Date(t.date)
                      const now = new Date()
                      return transactionDate.getMonth() === now.getMonth() && 
                             transactionDate.getFullYear() === now.getFullYear()
                    }).length}
                  </span>
                </div>
              </div>

              <button 
                className="btn-see-transactions"
                onClick={() => setSelectedAccount(isSelected ? null : account.id)}
              >
                {isSelected ? 'Ocultar movimientos' : 'Ver movimientos'}
              </button>

              {isSelected && (
                <div className="transactions-detail">
                  <h4>Movimientos Recientes</h4>
                  {accountTransactions.length === 0 ? (
                    <p className="no-transactions">No hay movimientos registrados</p>
                  ) : (
                    <div className="transactions-table-mini">
                      <table>
                        <thead>
                          <tr>
                            <th>Fecha</th>
                            <th>Tipo</th>
                            <th>Categoría</th>
                            <th>Descripción</th>
                            <th>Monto</th>
                          </tr>
                        </thead>
                        <tbody>
                          {accountTransactions.slice(0, 10).map(transaction => (
                            <tr key={transaction.id}>
                              <td>{new Date(transaction.date).toLocaleDateString()}</td>
                              <td>
                                <span className={`transaction-type-mini ${transaction.type}`}>
                                  {transaction.type === 'income' ? '📈' : '📉'}
                                </span>
                              </td>
                              <td>{transaction.category}</td>
                              <td>{transaction.description || '-'}</td>
                              <td className={`amount ${transaction.type}`}>
                                {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {accounts.length === 0 && (
        <div className="empty-accounts">
          <div className="empty-icon">🏦</div>
          <h3>No tienes cuentas registradas</h3>
          <p>Crea tu primera cuenta para comenzar a gestionar tus finanzas</p>
        </div>
      )}
    </div>
  )
}

export default AccountsView