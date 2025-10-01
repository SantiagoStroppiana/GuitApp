import { useState, useEffect } from 'react'
import '../styles/Dashboard.css'

const Dashboard = ({ accounts, transactions }) => {
  const [monthlyBalance, setMonthlyBalance] = useState(null)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  useEffect(() => {
    loadMonthlyBalance()
  }, [selectedMonth, selectedYear])

  const loadMonthlyBalance = async () => {
    if (window.electronAPI) {
      const balance = await window.electronAPI.getMonthlyBalance(selectedMonth, selectedYear)
      setMonthlyBalance(balance)
    }
  }

  const totalBalance = accounts.reduce((sum, account) => sum + account.current_balance, 0)

  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]

  return (
    <div className="dashboard">
      <h2>Dashboard Financiero</h2>
      
      <div className="summary-cards">
        <div className="summary-card">
          <h3>Balance Total</h3>
          <p className="summary-amount">${totalBalance.toFixed(2)}</p>
        </div>
        <div className="summary-card success">
          <h3>Cuentas Activas</h3>
          <p className="summary-amount success">{accounts.length}</p>
        </div>
        <div className="summary-card">
          <h3>Transacciones</h3>
          <p className="summary-amount">{transactions.length}</p>
        </div>
      </div>

      <div className="monthly-section">
        <div className="month-selector">
          <h3>Balance Mensual</h3>
          <div className="selectors">
            <select 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            >
              {months.map((month, index) => (
                <option key={index} value={index + 1}>{month}</option>
              ))}
            </select>
            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            >
              {[2023, 2024, 2025].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>

        {monthlyBalance && (
          <div className="monthly-balance">
            <div className="balance-cards">
              <div className="balance-card income">
                <h4>Ingresos</h4>
                <p className="balance-amount">+${monthlyBalance.income.toFixed(2)}</p>
              </div>
              <div className="balance-card expense">
                <h4>Gastos</h4>
                <p className="balance-amount">-${monthlyBalance.expenses.toFixed(2)}</p>
              </div>
              <div className="balance-card balance">
                <h4>Balance</h4>
                <p className={`balance-amount ${monthlyBalance.balance >= 0 ? 'positive' : 'negative'}`}>
                  ${monthlyBalance.balance.toFixed(2)}
                </p>
              </div>
            </div>

            {monthlyBalance.byCategory.length > 0 && (
              <div className="category-breakdown">
                <h4>Por Categoría</h4>
                <div className="categories">
                  {monthlyBalance.byCategory.map((item, index) => (
                    <div key={index} className={`category-item ${item.type}`}>
                      <span className="category-name">{item.category}</span>
                      <span className="category-amount">
                        {item.type === 'income' ? '+' : '-'}${item.total.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="accounts-overview">
        <h3>Resumen de Cuentas</h3>
        <div className="accounts-overview-grid">
          {accounts.map(account => (
            <div key={account.id} className="account-summary">
              <h4>{account.name}</h4>
              <p className="account-summary-type">{account.type}</p>
              <p className="account-summary-balance">${account.current_balance.toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Dashboard