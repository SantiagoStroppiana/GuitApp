import { useState } from 'react'
import '../styles/AccountManager.css'

const AccountManager = ({ accounts, onAccountCreated }) => {
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    type: 'banco',
    initialBalance: ''
  })

  const accountTypes = [
    { value: 'banco', label: 'Banco' },
    { value: 'efectivo', label: 'Efectivo' },
    { value: 'mercado_pago', label: 'Mercado Pago' },
    { value: 'billetera_virtual', label: 'Billetera Virtual' },
    { value: 'tarjeta_transporte', label: 'Tarjeta de Transporte' }
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (window.electronAPI) {
      if (editingId) {
        await window.electronAPI.updateAccount(editingId, {
          name: formData.name,
          type: formData.type
        })
      } else {
        await window.electronAPI.createAccount({
          name: formData.name,
          type: formData.type,
          initialBalance: parseFloat(formData.initialBalance)
        })
      }
      resetForm()
      onAccountCreated()
    }
  }

  const handleEdit = (account) => {
    setFormData({
      name: account.name,
      type: account.type,
      initialBalance: account.initial_balance
    })
    setEditingId(account.id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta cuenta?')) {
      if (window.electronAPI) {
        await window.electronAPI.deleteAccount(id)
        onAccountCreated()
      }
    }
  }

  const resetForm = () => {
    setFormData({ name: '', type: 'banco', initialBalance: '' })
    setEditingId(null)
    setShowForm(false)
  }

  return (
    <div className="account-manager">
      <div className="account-header">
        <h2>Gestión de Cuentas</h2>
        <button className="btn btn-primary" onClick={() => showForm ? resetForm() : setShowForm(true)}>
          {showForm ? 'Cancelar' : 'Nueva Cuenta'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="account-form">
          <div className="form-grid">
            <div className="form-group">
              <label>Nombre de la cuenta:</label>
              <input
                type="text"
                className="form-control"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Tipo de cuenta:</label>
              <select
                className="form-control"
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
              >
                {accountTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            {!editingId && (
              <div className="form-group">
                <label>Saldo inicial:</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control"
                  value={formData.initialBalance}
                  onChange={(e) => setFormData({...formData, initialBalance: e.target.value})}
                  required
                />
              </div>
            )}
          </div>
          <button type="submit" className="btn btn-success">
            {editingId ? 'Actualizar Cuenta' : 'Crear Cuenta'}
          </button>
        </form>
      )}

      <div className="accounts-list">
        <h3>Cuentas Existentes</h3>
        {accounts.length === 0 ? (
          <div className="empty-state">
            <h3>No hay cuentas creadas</h3>
            <p>Crea tu primera cuenta para comenzar a gestionar tus finanzas</p>
          </div>
        ) : (
          <div className="accounts-grid">
            {accounts.map(account => (
              <div key={account.id} className="account-card">
                <div className="account-card-header">
                  <h4 className="account-name">{account.name}</h4>
                  <span className="account-type">
                    {accountTypes.find(t => t.value === account.type)?.label}
                  </span>
                </div>
                <p className="account-balance">
                  ${account.current_balance.toFixed(2)}
                </p>
                <div className="account-actions">
                  <button 
                    className="btn btn-secondary"
                    onClick={() => handleEdit(account)}
                  >
                    Editar
                  </button>
                  <button 
                    className="btn btn-danger"
                    onClick={() => handleDelete(account.id)}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AccountManager