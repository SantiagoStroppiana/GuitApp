import { useState, useEffect } from 'react'
import QuickActions from './QuickActions'
import '../styles/MainDashboard.css'

const MainDashboard = ({ accounts, transactions, onDataChange }) => {
  const [showAllAccounts, setShowAllAccounts] = useState(false)
  const [monthlyData, setMonthlyData] = useState(null)

  const mainAccount = accounts.find(acc => acc.type === 'banco') || accounts[0]
  const totalBalance = accounts.reduce((sum, acc) => sum + acc.current_balance, 0)

  useEffect(() => {
    loadMonthlyData()
  }, [transactions])

  const loadMonthlyData = async () => {
    if (window.electronAPI) {
      const currentMonth = new Date().getMonth() + 1
      const currentYear = new Date().getFullYear()
      const data = await window.electronAPI.getMonthlyBalance(currentMonth, currentYear)
      setMonthlyData(data)
    }
  }

  const getExpensesByCategory = () => {
    if (!monthlyData?.byCategory) return []
    return monthlyData.byCategory
      .filter(item => item.type === 'expense')
      .slice(0, 5)
  }

  return (
    <div className="main-dashboard">
      <div className="dashboard-header">
        <h1>Mi Dashboard Financiero</h1>
        <div className="current-date">
          {new Date().toLocaleDateString('es-ES', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      <div className="main-balance-section">
        <div className="primary-balance">
          <h2>Balance Principal</h2>
          {mainAccount ? (
            <div className="balance-card-main">
              <div className="account-info">
                <h3>{mainAccount.name}</h3>
                <span className="account-type">{mainAccount.type}</span>
              </div>
              <div className="balance-amount-main">
                ${mainAccount.current_balance.toFixed(2)}
              </div>
            </div>
          ) : (
            <div className="no-accounts">
              <p>No hay cuentas registradas</p>
            </div>
          )}
          
          <button 
            className="btn-see-more"
            onClick={() => setShowAllAccounts(!showAllAccounts)}
          >
            {showAllAccounts ? 'Ver menos' : 'Ver más cuentas'}
          </button>
        </div>

        {showAllAccounts && (
          <div className="all-accounts-preview">
            <h3>Todas las Cuentas</h3>
            <div className="accounts-mini-grid">
              {accounts.map(account => (
                <div key={account.id} className="mini-account-card">
                  <div className="mini-account-name">{account.name}</div>
                  <div className="mini-account-balance">
                    ${account.current_balance.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
            <div className="total-balance">
              <strong>Balance Total: ${totalBalance.toFixed(2)}</strong>
            </div>
          </div>
        )}
      </div>

      <QuickActions accounts={accounts} onDataChange={onDataChange} />

      <div className="dashboard-summary">
        <div className="monthly-summary">
          <h3>Resumen del Mes</h3>
          {monthlyData ? (
            <div className="summary-cards-mini">
              <div className="summary-card-mini income">
                <div className="summary-label">Ingresos</div>
                <div className="summary-value">+${monthlyData.income.toFixed(2)}</div>
              </div>
              <div className="summary-card-mini expense">
                <div className="summary-label">Gastos</div>
                <div className="summary-value">-${monthlyData.expenses.toFixed(2)}</div>
              </div>
              <div className="summary-card-mini balance">
                <div className="summary-label">Balance</div>
                <div className={`summary-value ${monthlyData.balance >= 0 ? 'positive' : 'negative'}`}>
                  ${monthlyData.balance.toFixed(2)}
                </div>
              </div>
            </div>
          ) : (
            <p>Cargando datos...</p>
          )}
        </div>

        <div className="expenses-chart">
          <h3>Top Gastos por Categoría</h3>
          <div className="expenses-list">
            {getExpensesByCategory().map((expense, index) => (
              <div key={index} className="expense-item">
                <div className="expense-category">{expense.category}</div>
                <div className="expense-amount">${expense.total.toFixed(2)}</div>
                <div className="expense-bar">
                  <div 
                    className="expense-fill"
                    style={{
                      width: `${(expense.total / Math.max(...getExpensesByCategory().map(e => e.total))) * 100}%`
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MainDashboard